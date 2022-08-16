import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { DanetApplication } from '../src/app.ts';
import { BeforeControllerMethodIsCalled, OnAppBootstrap, OnAppClose } from '../src/hook/interfaces.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { HttpContext } from '../src/router/router.ts';

Deno.test('Scoped Lifecycle hooks', async (testContext) => {
	@Injectable({ scope: SCOPE.REQUEST })
	class ScopedInjectable implements BeforeControllerMethodIsCalled {
		public somethingThatMatters: string | null = null;
		async beforeControllerMethodIsCalled(ctx: HttpContext) {
			this.somethingThatMatters = `Received a ${ctx.request.method} request`;
		}
	}

	@Controller('scoped-controller/')
	class ScopedController {
		@Get()
		public returnSomethingThatMatters(): string| null {
			return this.child1.somethingThatMatters;
		}
		constructor(
			public child1: ScopedInjectable,
		) {
		}
	}

	@Module({
		controllers: [ScopedController],
		injectables: [
			ScopedInjectable,
		],
	})
	class MyModule {}

	const app = new DanetApplication();
	await app.init(MyModule);
	await testContext.step('handleRequest is called before request when defined in a scoped service', async () => {
		const port = (await app.listen(0)).port;

		const res = await fetch(`http://localhost:${port}/scoped-controller/`, {
			method: 'GET',
		});
		const text = await res.text();
		assertEquals(text, `Received a GET request`);
		await app.close();
	});

});
