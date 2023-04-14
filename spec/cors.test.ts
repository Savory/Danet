import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { assertEquals } from '../src/deps_test.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';

const app = new DanetApplication();
app.enableCors();

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
Deno.test('Options should answer 204', async () => {
	let res;
	try {
		await app.init(MyModule);
		const listenEvent = await app.listen(0);

		res = await fetch(
			`http://localhost:${listenEvent.port}/`,
			{
				method: 'OPTIONS',
			},
		);
		assertEquals(res.status, 204);
	} catch (e) {
		console.log(e);
	}
	await res?.body?.cancel();
	await app.close();
});
