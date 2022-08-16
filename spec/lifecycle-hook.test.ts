import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { DanetApplication } from '../src/app.ts';
import { OnAppBootstrap, OnAppClose } from '../src/hook/interfaces.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller } from '../src/router/controller/decorator.ts';

Deno.test('Lifecycle hooks', async (testContext) => {
	@Injectable({ scope: SCOPE.GLOBAL })
	class InjectableWithHook implements OnAppBootstrap, OnAppClose {
		public appBoostrapCalled = false;
		public appCloseCalled = false;
		onAppBootstrap() {
			this.appBoostrapCalled = true;
		}
		onAppClose() {
			this.appCloseCalled = true;
		}
	}

	@Controller('second-controller/')
	class ControllerWithHook implements OnAppBootstrap, OnAppClose {
		public appBoostrapCalled = false;
		public appCloseCalled = false;
		onAppBootstrap(): void | Promise<void> {
			this.appBoostrapCalled = true;
		}
		onAppClose() {
			this.appCloseCalled = true;
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
	class MyModule {}

	const app = new DanetApplication();
	await app.init(MyModule);

	await testContext.step('call global injectables onAppBootstrap hook', async () => {
		const injectableWithHook = await app.get(InjectableWithHook);
		assertEquals(injectableWithHook.appBoostrapCalled, true);
	});

	await testContext.step('call global controller onAppBootstrap hook', async () => {
		const controllerWithHook = await app.get(ControllerWithHook);
		assertEquals(controllerWithHook.appBoostrapCalled, true);
	});

	await testContext.step(
		'call injectables and controllers onAppClosehook when app is closed',
		async () => {
			await app.close();
			const injectableWithHook = await app.get(ControllerWithHook);
			const controllerWithHook = await app.get(InjectableWithHook);
			assertEquals(controllerWithHook.appCloseCalled, true);
			assertEquals(injectableWithHook.appCloseCalled, true);
		},
	);
});
