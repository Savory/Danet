import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import {
	All,
	Controller,
	Delete,
	Get,
	Patch,
	Post,
	Put,
} from '../src/router/controller/decorator.ts';

@Controller('nice-controller')
class SimpleController {
	@Get('/')
	simpleGet() {
		return 'OK GET';
	}

	@Post('/')
	simplePost() {
		return 'OK POST';
	}

	@Put('/')
	simplePut() {
		return 'OK PUT';
	}

	@Patch('/')
	simplePatch() {
		return 'OK PATCH';
	}

	@Delete('/')
	simpleDelete() {
		return 'OK DELETE';
	}

	@All('/all')
	all() {
		return 'OK ALL';
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

const app = new DanetApplication();
for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
	Deno.test(method, async () => {
		await app.init(MyModule);
		const listenEvent = await app.listen(0);

		const res = await fetch(
			`http://localhost:${listenEvent.port}/nice-controller`,
			{
				method,
			},
		);
		const text = await res.text();
		assertEquals(text, `OK ${method}`);
		await app.close();
	});
}

Deno.test('ALL', async () => {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
		const res = await fetch(
			`http://localhost:${listenEvent.port}/nice-controller/all`,
			{
				method: method,
			},
		);
		const text = await res.text();
		assertEquals(text, `OK ALL`);
	}
	await app.close();
});
