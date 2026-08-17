import { assertEquals, assertStrictEquals } from '../src/deps_test.ts';
import {
	APPLICATION_HOST,
	DanetApplication,
	Inject,
	Injectable,
	injector,
	Module,
} from '../src/mod.ts';
import type { OnAppBootstrap } from '../src/hook/interfaces.ts';

@Injectable()
class HostConsumer {
	constructor(
		@Inject(APPLICATION_HOST) public app: DanetApplication,
	) {}
}

@Module({
	injectables: [HostConsumer],
})
class ConsumerModule {}

Deno.test('injectable receives the application through APPLICATION_HOST', async () => {
	const app = new DanetApplication();
	await app.init(ConsumerModule);

	const consumer = await app.get(HostConsumer);
	assertStrictEquals(consumer.app, app);

	await app.close();
});

@Module({})
class RouteMountingModule implements OnAppBootstrap {
	onAppBootstrap() {
		const app = injector.get<DanetApplication>(APPLICATION_HOST);
		app.router.get('/host-mounted-route', (c) => c.text('mounted by host'));
	}
}

Deno.test('module hook mounts a route through the host', async () => {
	const app = new DanetApplication();
	await app.init(RouteMountingModule);
	const { port } = await app.listen(0);

	const res = await fetch(`http://localhost:${port}/host-mounted-route`);
	assertEquals(await res.text(), 'mounted by host');

	await app.close();
});

@Module({})
class FirstEmptyModule {}

@Module({})
class SecondEmptyModule {}

Deno.test('most recently initialized application wins', async () => {
	const first = new DanetApplication();
	const second = new DanetApplication();

	await first.init(FirstEmptyModule);
	assertStrictEquals(
		injector.get<DanetApplication>(APPLICATION_HOST),
		first,
	);

	await second.init(SecondEmptyModule);
	assertStrictEquals(
		injector.get<DanetApplication>(APPLICATION_HOST),
		second,
	);

	await first.close();
	await second.close();
});
