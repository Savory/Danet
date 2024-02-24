import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { BeforeControllerMethodIsCalled } from '../src/hook/interfaces.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { HttpContext } from '../src/router/router.ts';
import { Inject } from '../src/injector/decorator.ts';

Deno.test('Scoped Lifecycle hooks other order', async (testContext) => {
	interface ScopedInjectableInterface {
		somethingThatMatters: string | null;
	}

	@Injectable({ scope: SCOPE.REQUEST })
	class ScopedInjectable implements BeforeControllerMethodIsCalled {
		public somethingThatMatters: string | null = null;
		beforeControllerMethodIsCalled(ctx: HttpContext) {
			this.somethingThatMatters = `Received a ${ctx.req.method} request`;
		}
	}

	@Injectable()
	class InjectableUsingScoped {
		constructor(
			@Inject('SCOPED_TOKEN') public child1: ScopedInjectableInterface,
		) {
		}
		getData() {
			return this.child1.somethingThatMatters;
		}
	}

	@Controller('side-effect/')
	class SideEffectController {
		@Get()
		public returnSomethingThatMatters(): string | null {
			return this.child1.getData();
		}
		constructor(
			public child1: InjectableUsingScoped,
		) {
		}
	}

	@Controller('scoped-controller/')
	class ScopedController {
		@Get()
		public returnSomethingThatMatters(): string | null {
			return this.child1.somethingThatMatters;
		}
		constructor(
			@Inject('SCOPED_TOKEN') public child1: ScopedInjectableInterface,
		) {
		}
	}

	@Module({
		controllers: [ScopedController, SideEffectController],
		injectables: [
			{
				token: 'SCOPED_TOKEN',
				useClass: ScopedInjectable,
			},
			InjectableUsingScoped,
		],
	})
	class ParentAfterScopedModule {}

	await testContext.step(
		'handleRequest is called before request when defined in a scoped service',
		async () => {
			const app = new DanetApplication();
			await app.init(ParentAfterScopedModule);
			const listenEvent = await app.listen(0);

			const res = await fetch(
				`http://localhost:${listenEvent.port}/scoped-controller/`,
				{
					method: 'GET',
				},
			);
			const text = await res.text();
			assertEquals(text, `Received a GET request`);
			await app.close();
		},
	);

	await testContext.step(
		'handleRequest is called before request when defined in a scoped service but thats a side effect',
		async () => {
			const app = new DanetApplication();
			await app.init(ParentAfterScopedModule);
			const listenEvent = await app.listen(0);

			const res = await fetch(
				`http://localhost:${listenEvent.port}/side-effect/`,
				{
					method: 'GET',
				},
			);
			const text = await res.text();
			assertEquals(text, `Received a GET request`);
			await app.close();
		},
	);
});
