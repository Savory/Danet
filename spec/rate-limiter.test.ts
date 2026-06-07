import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';
import {
	InMemoryThrottlerStorage,
	SkipThrottle,
	Throttle,
	ThrottlerGuard,
	ThrottlerModule,
} from '../src/throttler/mod.ts';

/**
 * Fires `count` sequential GET requests against `url` and returns the
 * resolved `Response` for each, in order. Requests are sequential so the
 * throttler counter increments deterministically (no storage races).
 */
async function fireSequentially(
	url: string,
	count: number,
): Promise<Response[]> {
	const responses: Response[] = [];
	for (let i = 0; i < count; i++) {
		const res = await fetch(url, { method: 'GET' });
		await res.body?.cancel();
		responses.push(res);
	}
	return responses;
}

Deno.test('Throttler blocks requests once the limit is exceeded', async () => {
	@Controller('throttled')
	class ThrottledController {
		@Get('/')
		simpleGet() {
			return 'OK';
		}
	}

	@Module({
		imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 2 }])],
		controllers: [ThrottledController],
		injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
	})
	class AppModule {}

	const app = new DanetApplication();
	await app.init(AppModule);
	const { port } = await app.listen(0);
	const url = `http://localhost:${port}/throttled`;

	const responses = await fireSequentially(url, 3);
	// First two requests are within the limit.
	assertEquals(responses[0].status, 200);
	assertEquals(responses[1].status, 200);
	// Third request exceeds the limit of 2.
	assertEquals(responses[2].status, 429);

	// The blocked request returns a Danet HttpException-shaped body.
	const blocked = await fetch(url);
	const json = await blocked.json();
	assertEquals(json, {
		name: 'ThrottlerException',
		status: 429,
		description: 'ThrottlerException: Too Many Requests',
		message: '429 - ThrottlerException: Too Many Requests',
	});

	await app.close();
});

Deno.test('Throttler exposes rate-limit headers', async () => {
	@Controller('with-headers')
	class HeadersController {
		@Get('/')
		simpleGet() {
			return 'OK';
		}
	}

	@Module({
		imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 2 }])],
		controllers: [HeadersController],
		injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
	})
	class AppModule {}

	const app = new DanetApplication();
	await app.init(AppModule);
	const { port } = await app.listen(0);
	const url = `http://localhost:${port}/with-headers`;

	const first = await fetch(url);
	await first.body?.cancel();
	assertEquals(first.status, 200);
	assertEquals(first.headers.get('x-ratelimit-limit'), '2');
	assertEquals(first.headers.get('x-ratelimit-remaining'), '1');

	const second = await fetch(url);
	await second.body?.cancel();
	assertEquals(second.headers.get('x-ratelimit-remaining'), '0');

	// Once blocked, the response advertises how long to wait via Retry-After.
	const blocked = await fetch(url);
	await blocked.body?.cancel();
	assertEquals(blocked.status, 429);
	assertEquals(blocked.headers.get('retry-after'), '60');

	await app.close();
});

Deno.test('Throttler counter resets after the ttl elapses', async () => {
	@Controller('reset')
	class ResetController {
		@Get('/')
		simpleGet() {
			return 'OK';
		}
	}

	@Module({
		imports: [ThrottlerModule.forRoot([{ ttl: 500, limit: 1 }])],
		controllers: [ResetController],
		injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
	})
	class AppModule {}

	const app = new DanetApplication();
	await app.init(AppModule);
	const { port } = await app.listen(0);
	const url = `http://localhost:${port}/reset`;

	const first = await fetch(url);
	await first.body?.cancel();
	assertEquals(first.status, 200);

	const second = await fetch(url);
	await second.body?.cancel();
	assertEquals(second.status, 429);

	// Wait for the window to expire, then the counter should be fresh.
	await new Promise((resolve) => setTimeout(resolve, 600));

	const third = await fetch(url);
	await third.body?.cancel();
	assertEquals(third.status, 200);

	await app.close();
});

Deno.test('@SkipThrottle disables throttling for a route', async () => {
	@Controller('skip')
	class SkipController {
		@SkipThrottle()
		@Get('/')
		simpleGet() {
			return 'OK';
		}
	}

	@Module({
		imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 1 }])],
		controllers: [SkipController],
		injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
	})
	class AppModule {}

	const app = new DanetApplication();
	await app.init(AppModule);
	const { port } = await app.listen(0);
	const url = `http://localhost:${port}/skip`;

	const responses = await fireSequentially(url, 5);
	for (const res of responses) {
		assertEquals(res.status, 200);
	}

	await app.close();
});

Deno.test('@Throttle overrides the limit for a route', async () => {
	@Controller('override')
	class OverrideController {
		// Stricter than the global config: only one request allowed.
		@Throttle({ default: { ttl: 60000, limit: 1 } })
		@Get('/')
		simpleGet() {
			return 'OK';
		}
	}

	@Module({
		imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])],
		controllers: [OverrideController],
		injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
	})
	class AppModule {}

	const app = new DanetApplication();
	await app.init(AppModule);
	const { port } = await app.listen(0);
	const url = `http://localhost:${port}/override`;

	const responses = await fireSequentially(url, 2);
	assertEquals(responses[0].status, 200);
	assertEquals(responses[1].status, 429);

	await app.close();
});

Deno.test('InMemoryThrottlerStorage evicts expired windows', async () => {
	const storage = new InMemoryThrottlerStorage();

	// Two short-lived windows are tracked.
	storage.increment('client-a', 50);
	storage.increment('client-b', 50);
	assertEquals(storage.size, 2);

	// Once the windows expire, their eviction timers fire and drop the keys
	// instead of letting the map grow unbounded.
	await new Promise((resolve) => setTimeout(resolve, 100));
	assertEquals(storage.size, 0);
});

Deno.test('Multiple named throttlers are all enforced', async () => {
	@Controller('multi')
	class MultiController {
		@Get('/')
		simpleGet() {
			return 'OK';
		}
	}

	@Module({
		imports: [
			ThrottlerModule.forRoot([
				{ name: 'short', ttl: 60000, limit: 2 },
				{ name: 'long', ttl: 60000, limit: 5 },
			]),
		],
		controllers: [MultiController],
		injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
	})
	class AppModule {}

	const app = new DanetApplication();
	await app.init(AppModule);
	const { port } = await app.listen(0);
	const url = `http://localhost:${port}/multi`;

	const responses = await fireSequentially(url, 3);
	// The 'short' throttler (limit 2) blocks before 'long' (limit 5) does.
	assertEquals(responses[0].status, 200);
	assertEquals(responses[1].status, 200);
	assertEquals(responses[2].status, 429);

	await app.close();
});
