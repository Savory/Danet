import {
	assertEquals,
	assertInstanceOf,
	assertNotEquals,
	assertRejects,
} from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Route } from 'https://deno.land/x/oak@v10.5.1/router.ts';
import { DanetApplication } from './app.ts';
import { GLOBAL_GUARD } from './guard/constants.ts';
import { AuthGuard } from './guard/interface.ts';
import { OnAppBootstrap, OnAppClose } from './hook/interfaces.ts';
import { Inject } from './injector/decorator.ts';
import { TokenInjector } from './injector/injectable/constructor.ts';
import { Controller, Get, Post } from './router/controller/decorator.ts';
import { Injectable, SCOPE } from './injector/injectable/decorator.ts';
import { Module, ModuleOptions } from './module/decorator.ts';
import { HttpContext } from './router/router.ts';

Deno.test('app init', async (testContext) => {
	interface IDBService {
		data: string;
	}

	@Injectable()
	class GlobalGuard implements AuthGuard {
		canActivate(context: HttpContext): boolean {
			context.state.coucou = 'coucou';
			return true;
		}
	}

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

	@Injectable({ scope: SCOPE.REQUEST })
	class Child1 {
		constructor(public child: InjectableWithHook) {
		}

		sayHelloWorld() {
			return 'helloWorld';
		}
	}

	@Injectable()
	class DatabaseService implements IDBService {
		public data = 'coucou';
		constructor() {}
	}

	@Controller('first-controller')
	class FirstController {
		public id = crypto.randomUUID();
		constructor(public child1: Child1) {
		}
		@Get()
		getMethod() {
		}

		@Post('post')
		postMethod() {
		}
	}
	@Controller('second-controller/')
	class SingletonControllerWithHook implements OnAppBootstrap, OnAppClose {
		public id = crypto.randomUUID();
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
			@Inject('DB_SERVICE') public dbService: IDBService,
		) {
		}
		@Get('')
		getMethod() {
		}

		@Post('/post/')
		postMethod() {
		}
	}

	@Module({
		controllers: [SingletonControllerWithHook],
		injectables: [
			InjectableWithHook,
			new TokenInjector(DatabaseService, 'DB_SERVICE'),
		],
	})
	class SecondModule {}

	const firstModuleOption: ModuleOptions = {
		imports: [SecondModule],
		controllers: [FirstController],
		injectables: [
			Child1,
			InjectableWithHook,
			new TokenInjector(GlobalGuard, GLOBAL_GUARD),
		],
	};
	@Module(firstModuleOption)
	class FirstModule {}

	@Module({
		controllers: [FirstController],
		injectables: [Child1],
	})
	class ModuleWithMissingProvider {}

	const app = new DanetApplication();
	await app.bootstrap(FirstModule);

	function expectControllerRouterToExist(
		keys: IterableIterator<Route<string>>,
		controllerEndpoint: string,
	) {
		const firstRouter = keys.next().value;
		assertEquals(firstRouter.path, controllerEndpoint);
		assertEquals(firstRouter.methods, ['HEAD', 'GET']);
		const secondRouter = keys.next().value;
		assertEquals(secondRouter.path, controllerEndpoint + '/post');
		assertEquals(secondRouter.methods, ['POST']);
	}

	await testContext.step('it registers all module controllers', () => {
		const keys = app.router.keys();
		expectControllerRouterToExist(keys, 'second-controller');
		expectControllerRouterToExist(keys, 'first-controller');
	});

	await testContext.step(
		'it inject controllers dependencies if they are provided by current module or previously loaded module',
		() => {
			const firstController = app.get(FirstController)!;
			assertInstanceOf(firstController.child1, Child1);
			assertEquals(firstController.child1.sayHelloWorld(), 'helloWorld');
			const secondController = app.get(SingletonControllerWithHook)!;
			assertInstanceOf(secondController.child2, InjectableWithHook);
			assertInstanceOf(secondController.dbService, DatabaseService);
		},
	);

	await testContext.step(
		'controllers are singleton if none of their depency is scoped',
		() => {
			const firstInstance = app.get<SingletonControllerWithHook>(
				SingletonControllerWithHook,
			)!;
			const secondInstance = app.get<SingletonControllerWithHook>(
				SingletonControllerWithHook,
			)!;
			assertEquals(firstInstance.id, secondInstance.id);
		},
	);

	await testContext.step(
		'controllers are not singleton if one of their dependencies is request scoped',
		() => {
			const firstInstance = app.get<FirstController>(FirstController)!;
			const secondInstance = app.get<FirstController>(FirstController)!;
			assertNotEquals(firstInstance.id, secondInstance.id);
		},
	);

	await testContext.step('it inject GLOBAL_GUARD', () => {
		const globalGuard = app.get(GLOBAL_GUARD);
		assertInstanceOf(globalGuard, GlobalGuard);
	});

	await testContext.step(
		'it throws if controllers dependencies are not available in context or globally',
		() => {
			const failingApp = new DanetApplication();
			assertRejects(() => failingApp.bootstrap(ModuleWithMissingProvider));
		},
	);

	await testContext.step('call global injectables onAppBootstrap hook', () => {
		const injectableWithHook = app.get(InjectableWithHook);
		assertEquals(injectableWithHook.appBoostrapCalled, true);
	});

	await testContext.step('call global controller onAppBootstrap hook', () => {
		const controllerWithHook = app.get(SingletonControllerWithHook);
		assertEquals(controllerWithHook.appBoostrapCalled, true);
	});

	await testContext.step(
		'call injectables and controllers onAppClosehook when app is closed',
		async () => {
			await app.close();
			const injectableWithHook = app.get(SingletonControllerWithHook);
			const controllerWithHook = app.get(InjectableWithHook);
			assertEquals(controllerWithHook.appCloseCalled, true);
			assertEquals(injectableWithHook.appCloseCalled, true);
		},
	);
});
