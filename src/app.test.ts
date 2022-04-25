import { assertEquals, assertInstanceOf, assertThrows } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Route } from 'https://deno.land/x/oak@v9.0.1/router.ts';
import { DanetApplication } from './app.ts';
import { GLOBAL_GUARD } from './guard/constants.ts';
import { AuthGuard } from './guard/interface.ts';
import { TokenInjector } from './injectable/constructor.ts';
import { Controller, Get, Post } from './router/controller/decorator.ts';
import { Injectable, SCOPE } from './injectable/decorator.ts';
import { Module, ModuleOptions } from './module/decorator.ts';
import { HttpContext } from './router/router.ts';

Deno.test('app init', async (testContext) => {

  @Injectable()
  class GlobalGuard implements AuthGuard {
    canActivate(context: HttpContext): void {
      context.state.coucou = 'coucou';
    }
  }

  @Injectable({ scope: SCOPE.REQUEST })
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

  @Controller('first-controller')
  class FirstController {
    constructor(public child1: Child1, public child2: Child2) {
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
    constructor(public child1: Child1, public child2: Child2) {
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
    injectables: [Child1, Child2]
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
    assertInstanceOf(firstController.child2, Child2);
    const secondController = app.get(SecondController)!;
    assertInstanceOf(secondController.child1, Child1);
    assertInstanceOf(secondController.child2, Child2);
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
