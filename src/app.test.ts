import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
  assertThrows
} from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Route } from 'https://deno.land/x/oak@v9.0.1/router.ts';
import { DanetApplication } from './app.ts';
import { GLOBAL_GUARD } from './guard/constants.ts';
import { AuthGuard } from './guard/interface.ts';
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
  class Child2 {

  }

  @Injectable({ scope: SCOPE.REQUEST })
  class Child1 {
    constructor(public child: Child2) {
    }

    sayHelloWorld() {
      return 'helloWorld';
    }
  }

  @Injectable()
  class DatabaseService implements IDBService{
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
  class SecondController {
    public id = crypto.randomUUID();
    constructor(public child2: Child2, @Inject('DB_SERVICE') public dbService: IDBService) {
    }
    @Get('')
    getMethod() {

    }

    @Post('/post/')
    postMethod() {

    }
  }

  @Module({
    controllers: [SecondController],
    injectables: [Child2, new TokenInjector(DatabaseService, 'DB_SERVICE')]
  })
  class SecondModule {}

  const firstModuleOption: ModuleOptions = {
    imports: [SecondModule],
    controllers: [FirstController],
    injectables: [Child1, Child2, new TokenInjector(GlobalGuard, GLOBAL_GUARD)]
  };
  @Module(firstModuleOption)
  class FirstModule {}

  @Module({
    controllers: [FirstController],
    injectables: [Child1]
  })
  class ModuleWithMissingProvider {}

  const app = new DanetApplication();
  app.bootstrap(FirstModule);

  function expectControllerRouterToExist(keys: IterableIterator<Route>, controllerEndpoint: string) {
    const firstRouter = keys.next().value;
    assertEquals(firstRouter.path, controllerEndpoint);
    assertEquals(firstRouter.methods, [ 'HEAD', 'GET' ]);
    const secondRouter = keys.next().value;
    assertEquals(secondRouter.path, controllerEndpoint + '/post');
    assertEquals(secondRouter.methods, [ 'POST' ]);
  }

  await testContext.step('it registers all module controllers', () => {
    const keys = app.router.keys();
    expectControllerRouterToExist(keys,'second-controller');
    expectControllerRouterToExist(keys,'first-controller');
  });

  await testContext.step('it inject controllers dependencies if they are provided by current module or previously loaded module', () => {
    const firstController = app.get(FirstController)!;
    assertInstanceOf(firstController.child1, Child1);
    assertEquals(firstController.child1.sayHelloWorld(), 'helloWorld');
    const secondController = app.get(SecondController)!;
    assertInstanceOf(secondController.child2, Child2);
    assertInstanceOf(secondController.dbService, DatabaseService);
  });

  await testContext.step('controllers are singleton if none of their depency is scoped', () => {
    const firstInstance = app.get<SecondController>(SecondController)!;
    const secondInstance = app.get<SecondController>(SecondController)!;
    assertEquals(firstInstance.id, secondInstance.id);
  });

  await testContext.step('controllers are not singleton if one of their dependencies is request scoped', () => {
    const firstInstance = app.get<FirstController>(FirstController)!;
    const secondInstance = app.get<FirstController>(FirstController)!;
    assertNotEquals(firstInstance.id, secondInstance.id);
  });

  await testContext.step('it inject GLOBAL_GUARD', () => {
    const globalGuard = app.get(GLOBAL_GUARD);
    assertInstanceOf(globalGuard, GlobalGuard);
  });

  await testContext.step('it throws if controllers dependencies are not available in context or globally', () => {
    const failingApp = new DanetApplication();
    assertThrows(() => failingApp.bootstrap(ModuleWithMissingProvider));
  });

  await testContext.step('it inject GLOBAL_GUARD and router us eit', () => {
  });
});
