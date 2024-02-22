import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { OnAppBootstrap, OnAppClose } from '../src/hook/interfaces.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller } from '../src/router/controller/decorator.ts';

Deno.test('Lifecycle hooks', async (testContext) => {
	let moduleOnAppBootstrapCalled = false;

	@Injectable({ scope: SCOPE.GLOBAL })
	class InjectableWithHook implements OnAppBootstrap, OnAppClose {
		public appBoostrapCalled = 0;
		public appCloseCalled = 0;
		onAppBootstrap() {
			this.appBoostrapCalled += 1;
		}
		onAppClose() {
			this.appCloseCalled += 1;
		}
	}

	@Controller('second-controller/')
	class ControllerWithHook implements OnAppBootstrap, OnAppClose {
		public appBoostrapCalled = 0;
		public appCloseCalled = 0;
		onAppBootstrap(): void | Promise<void> {
			this.appBoostrapCalled += 1;
		}
		onAppClose() {
			this.appCloseCalled += 1;
		}

		constructor(
			public child2: InjectableWithHook,
		) {
		}
	}

	@Module({
		controllers: [ControllerWithHook],
		injectables: [
			InjectableWithHook,
		],
	})
	class MyModule implements OnAppBootstrap {
		onAppBootstrap(): void | Promise<void> {
			moduleOnAppBootstrapCalled = true;
		}
	}

	const app = new DanetApplication();
	await app.init(MyModule);

	await testContext.step(
		'call global injectables onAppBootstrap hook',
		async () => {
			const injectableWithHook = await app.get(InjectableWithHook);
			assertEquals(injectableWithHook.appBoostrapCalled, 1);
		},
	);

	await testContext.step('call module onAppBoostrap hook', () => {
		assertEquals(moduleOnAppBootstrapCalled, true);
	});

	await testContext.step(
		'call global controller onAppBootstrap hook',
		async () => {
			const controllerWithHook = await app.get(ControllerWithHook);
			assertEquals(controllerWithHook.appBoostrapCalled, 1);
		},
	);

	await testContext.step(
		'call injectables and controllers onAppClosehook when app is closed',
		async () => {
			await app.close();
			const injectableWithHook = await app.get(ControllerWithHook);
			const controllerWithHook = await app.get(InjectableWithHook);
			assertEquals(controllerWithHook.appCloseCalled, 1);
			assertEquals(injectableWithHook.appCloseCalled, 1);
		},
	);
});
