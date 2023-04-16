import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { assertEquals } from '../src/deps_test.ts';
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
Deno.test('GET on fresh prefix should answer 200 with island. Otherwise answer Danet handler', async () => {
	let res;
	const app = new DanetApplication();
	try {
		const freshAppDirectory = new URL('./fresh/', import.meta.url);
		await app.enableFresh(freshAppDirectory, '/dashboard');
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
		await app.close();
		throw e;
	}
	await app.close();
});

Deno.test('GET without API prefix should answer 200 with island. Otherwise answer Danet handler', async () => {
	let res;
	const app = new DanetApplication();
	try {
		const freshAppDirectory = new URL('./fresh/', import.meta.url);
		await app.enableFreshOnRoot(freshAppDirectory, '/api', {});
		await app.init(MyModule);
		const listenEvent = await app.listen(0);

		res = await fetch(
			`http://localhost:${listenEvent.port}/`,
			{
				method: 'GET',
			},
		);
		assertEquals(res.status, 200);
		let content = await res.text();
		assertEquals(content.includes('Welcome to `fresh`'), true);

		res = await fetch(
			`http://localhost:${listenEvent.port}/api/todo`,
			{
				method: 'GET',
			},
		);
		assertEquals(res.status, 200);
		content = await res.text();
		assertEquals(content, 'hello');
	} catch (e) {
		await app.close();
		throw e;
	}
	await app.close();
});
