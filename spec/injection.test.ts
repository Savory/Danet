import {
	assertEquals,
	assertInstanceOf,
	assertNotEquals,
	assertRejects,
} from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';
import { AuthGuard } from '../src/guard/interface.ts';
import { Inject } from '../src/injector/decorator.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/decorator.ts';
import { Module, ModuleMetadata } from '../src/module/decorator.ts';
import { Controller, Get, Post } from '../src/router/controller/decorator.ts';
import { HttpContext } from '../src/router/router.ts';
import { injector } from '../src/injector/injector.ts';
import { Injector, TokenInjector } from '../mod.ts';

Deno.test('Injection', async (testContext) => {
	interface IDBService {
		data: string;
		id: string;
	}

	interface ConfigurationObject {
		name: string;
		port: number;
	}

	@Injectable()
	class GlobalGuard implements AuthGuard {
		canActivate(context: HttpContext): boolean {
			return true;
		}
	}

	@Injectable({ scope: SCOPE.GLOBAL })
	class GlobalInjectable {
	}

	@Injectable({ scope: SCOPE.REQUEST })
	class Child1 {
		public id = crypto.randomUUID();
		constructor(
			public child: GlobalInjectable,
			@Inject('DB_SERVICE') public dbService: IDBService,
		) {
		}

		sayHelloWorld() {
			return 'helloWorld';
		}
	}

	@Injectable()
	class DatabaseService implements IDBService {
		public data = 'coucou';
		public id = crypto.randomUUID();
		constructor() {
			console.log('we construct');
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
			@Inject('CONFIGURATION') public injectedPlainObject: ConfigurationObject,
		) {
		}

		@Get('')
		getMethod() {
			return `${this.injectedPlainObject.name} and ${this.injectedPlainObject.port}`;
		}

		@Post('/post/')
		postMethod() {
		}
	}

	@Module({})
	class SecondModule {
		static forRoot() {
			return {
				controllers: [SingletonController],
				injectables: [
					GlobalInjectable,
					new TokenInjector(DatabaseService, 'DB_SERVICE'),
					{
						token: 'CONFIGURATION',
						useValue: {
							name: 'toto',
							port: '4000',
						},
					},
				],
				module: SecondModule,
			};
		}
	}

	const firstModuleOption: ModuleMetadata = {
		imports: [SecondModule.forRoot()],
		controllers: [FirstController],
		injectables: [
			Child1,
			GlobalInjectable,
			{
				token: GLOBAL_GUARD,
				useClass: GlobalGuard,
			},
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

	await testContext.step(
		'it throws if controllers dependencies are not available in context or globally',
		() => {
			const failingApp = new DanetApplication();
			assertRejects(() => failingApp.init(ModuleWithMissingProvider));
		},
	);

	const app = new DanetApplication();
	await app.init(FirstModule);

	await testContext.step(
		'it inject controllers dependencies if they are provided by current module or previously loaded module',
		async () => {
			const firstController = await app.get(FirstController)!;
			assertInstanceOf(firstController.child1, Child1);
			assertEquals(firstController.child1.sayHelloWorld(), 'helloWorld');
			assertEquals(firstController.child1.dbService.data, 'coucou');
			const singletonController = await app.get(SingletonController)!;
			assertInstanceOf(singletonController.child2, GlobalInjectable);
			assertInstanceOf(singletonController.dbService, DatabaseService);
			assertEquals(
				firstController.child1.dbService.id,
				singletonController.dbService.id,
			);
		},
	);

	await testContext.step(
		'controllers are singleton if none of their depency is scoped',
		async () => {
			const firstInstance = await app.get<SingletonController>(
				SingletonController,
			)!;
			const secondInstance = await app.get<SingletonController>(
				SingletonController,
			)!;
			assertEquals(firstInstance.id, secondInstance.id);
		},
	);

	await testContext.step(
		'controllers are not singleton if one of their dependencies is request scoped',
		async () => {
			const firstInstance = await app.get<FirstController>(FirstController)!;
			const secondInstance = await app.get<FirstController>(FirstController)!;
			assertNotEquals(firstInstance.id, secondInstance.id);
			assertNotEquals(firstInstance.child1.id, secondInstance.child1.id);
		},
	);

	await testContext.step('it inject GLOBAL_GUARD', async () => {
		const globalGuard = await app.get(GLOBAL_GUARD);
		assertInstanceOf(globalGuard, GlobalGuard);
	});

	await testContext.step(
		'inject plain object when using useValue',
		async () => {
			const firstInstance = await app.get<SingletonController>(
				SingletonController,
			)!;
			assertEquals(firstInstance.getMethod(), 'toto and 4000');
		},
	);
});
