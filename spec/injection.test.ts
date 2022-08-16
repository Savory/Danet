import {
	assertEquals,
	assertInstanceOf,
	assertNotEquals,
	assertRejects,
} from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Route } from 'https://deno.land/x/oak@v10.5.1/router.ts';
import { DanetApplication } from '../src/app.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';
import { AuthGuard } from '../src/guard/interface.ts';
import { Inject } from '../src/injector/decorator.ts';
import { TokenInjector } from '../src/injector/injectable/constructor.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/decorator.ts';
import { Module, ModuleOptions } from '../src/module/decorator.ts';
import { Controller, Get, Post } from '../src/router/controller/decorator.ts';
import { HttpContext } from '../src/router/router.ts';

Deno.test('Injection', async (testContext) => {
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
	class GlobalInjectable {
	}

	@Injectable({ scope: SCOPE.REQUEST })
	class Child1 {
		public id = crypto.randomUUID();
		constructor(public child: GlobalInjectable) {
		}

		sayHelloWorld() {
			return 'helloWorld';
		}
	}

	@Injectable()
	class DatabaseService implements IDBService {
		public data = 'coucou';

		constructor() {
		}
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
	class SingletonController {
		public id = crypto.randomUUID();
		public appBoostrapCalled = false;
		public appCloseCalled = false;

		constructor(
			public child2: GlobalInjectable,
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
		controllers: [SingletonController],
		injectables: [
			GlobalInjectable,
			new TokenInjector(DatabaseService, 'DB_SERVICE'),
		],
	})
	class SecondModule {
	}

	const firstModuleOption: ModuleOptions = {
		imports: [SecondModule],
		controllers: [FirstController],
		injectables: [
			Child1,
			GlobalInjectable,
			new TokenInjector(GlobalGuard, GLOBAL_GUARD),
		],
	};

	@Module(firstModuleOption)
	class FirstModule {
	}

	@Module({
		controllers: [FirstController],
		injectables: [Child1],
	})
	class ModuleWithMissingProvider {
	}

	const app = new DanetApplication();
	await app.init(FirstModule);

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
		expectControllerRouterToExist(keys, '/second-controller');
		expectControllerRouterToExist(keys, '/first-controller');
	});

	await testContext.step(
		'it inject controllers dependencies if they are provided by current module or previously loaded module',
		() => {
			const firstController = app.get(FirstController)!;
			assertInstanceOf(firstController.child1, Child1);
			assertEquals(firstController.child1.sayHelloWorld(), 'helloWorld');
			const secondController = app.get(SingletonController)!;
			assertInstanceOf(secondController.child2, GlobalInjectable);
			assertInstanceOf(secondController.dbService, DatabaseService);
		},
	);

	await testContext.step(
		'controllers are singleton if none of their depency is scoped',
		() => {
			const firstInstance = app.get<SingletonController>(
				SingletonController,
			)!;
			const secondInstance = app.get<SingletonController>(
				SingletonController,
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
			assertNotEquals(firstInstance.child1.id, secondInstance.child1.id);
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
			assertRejects(() => failingApp.init(ModuleWithMissingProvider));
		},
	);
});
