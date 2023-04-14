import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { assertEquals } from '../src/deps_test.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';

const app = new DanetApplication();
const freshAppDirectory = new URL('./fresh/', import.meta.url);
await app.enableFresh(freshAppDirectory, '/dashboard');

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
Deno.test('GET on fresh prefix should answer 200 with island. Otherwise answer Danet handler', async () => {
	let res;
	try {
		await app.init(MyModule);
		const listenEvent = await app.listen(0);

		res = await fetch(
			`http://localhost:${listenEvent.port}/dashboard`,
			{
				method: 'GET',
			},
		);
		assertEquals(res.status, 200);
		let content = await res.text();
		assertEquals(content.includes('Welcome to `fresh`'), true);

		res = await fetch(
			`http://localhost:${listenEvent.port}/todo`,
			{
				method: 'GET',
			},
		);
		assertEquals(res.status, 200);
		content = await res.text();
		assertEquals(content, 'hello');
	} catch (e) {
		console.log(e);
	}
	await app.close();
});
