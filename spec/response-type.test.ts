import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { assertEquals } from '../src/deps_test.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { Post } from '../mod.ts';

class Todo {
	constructor(private name: string, private description: string) {

	}
}
const app = new DanetApplication();
app.enableCors();

@Controller('todo')
class MyController {
	@Get('')
	async simpleGet() {
		return new Todo('test', 'ok');
	}

	@Post('')
	async simplePost() {
		return new Todo('test', 'ok');
	}
}

@Module({
	controllers: [MyController],
})
class MyModule {}
Deno.test('Should send back json', async () => {
	let res;
		await app.init(MyModule);
		const listenEvent = await app.listen(0);

		res = await fetch(
			`http://localhost:${listenEvent.port}/todo`,
		);
		let todo = await res.json();
		assertEquals(todo, { name: "test", description: "ok"});
		res = await fetch(
			`http://localhost:${listenEvent.port}/todo`,
			{
				method: "POST"
			}
		);
		todo = await res.json();
		assertEquals(todo, { name: "test", description: "ok"});
	await app.close();
});
