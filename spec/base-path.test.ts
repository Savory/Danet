import { assertEquals, path } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';

@Controller('todo')
class MyController {
	@Get('')
	simpleGet() {
		return 'hello';
	}
}

@Module({
	controllers: [MyController],
})
class MyModule {}

Deno.test('base path is registered', async () => {
	const app = new DanetApplication();
	app.registerBasePath('/api/');
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}/api/todo`, {
		method: 'GET',
	});
	const text = await res.text();
	assertEquals(text, 'hello');
	await app.close();
});
