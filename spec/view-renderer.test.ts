import { assertEquals, path } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Render } from '../src/renderer/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { HandlebarRenderer } from '../src/renderer/handlebar.ts';

@Controller('nice-controller')
class SimpleController {
	@Render('index')
	@Get('/')
	simpleGet() {
		return { title: 'my title' };
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

Deno.test('Hbs renderer', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const viewPath = path.dirname(path.fromFileUrl(import.meta.url)) + '/views';
	app.setRenderer(new HandlebarRenderer())
	app.setViewEngineDir(viewPath);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/nice-controller`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text.includes('my title'), true);
	await app.close();
});
