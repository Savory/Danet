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

Deno.test('it serve static files', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const staticAssetsPath = path.dirname(path.fromFileUrl(import.meta.url)) +
		'/static';
	app.useStaticAssets(staticAssetsPath);
	const port = (await app.listen(0)).port;

	const res = await fetch(`http://localhost:${port}/test.txt`, {
		method: 'GET',
	});
	const blob = await res.blob();
	const text = await blob.text();
	assertEquals(text.indexOf('I love pikachu'), 0);
	await app.close();
});

Deno.test('serving static file does not break routes', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const staticAssetsPath = path.dirname(path.fromFileUrl(import.meta.url)) +
		'/static';
	app.useStaticAssets(staticAssetsPath);
	const port = (await app.listen(0)).port;

	const res = await fetch(`http://localhost:${port}/todo`, {
		method: 'GET',
	});
	const text = await res.text();
	assertEquals(text, 'hello');
	await app.close();
});
