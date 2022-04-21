import { assertEquals, assertInstanceOf, assertThrows } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { DeNestApplication } from './app.ts';
import { Controller, Get, Post } from './controller/decorator.ts';
import { Injectable, SCOPE } from './injectable/decorator.ts';
import { Injector } from './injector/injector.ts';
import { Module } from './module/decorator.ts';

Deno.test('app init', async (testContext) => {

  @Injectable({ scope: SCOPE.REQUEST })
  class Child2 {

  }

  @Injectable({ scope: SCOPE.REQUEST })
  class Child1 {
    constructor(public child: Child2) {
    }
  }

  @Controller('controller-endpoint')
  class FirstController {
    constructor(public child1: Child1, public child2: Child2) {
    }
    @Get('')
    getMethod() {

    }

    @Post('post')
    postMethod() {

    }
  }
  @Module({
    controllers: [FirstController],
    injectables: [Child1, Child2]
  })
  class MyModule {}

  @Module({
    controllers: [FirstController],
    injectables: [Child1]
  })
  class ModuleWithMissingProvider {}

  const app = new DeNestApplication();
  app.bootstrap(MyModule);
  await testContext.step('it registers module controllers', () => {
    const keys = app.router.keys();
    const firstRouter = keys.next().value;
    assertEquals(firstRouter.path, 'controller-endpoint');
    assertEquals(firstRouter.methods, ['HEAD', 'GET']);
    const secondRouter = keys.next().value;
    assertEquals(secondRouter.path, 'controller-endpoint/post');
    assertEquals(secondRouter.methods, ['POST']);
  });

  await testContext.step('it inject controllers dependencies if they are provider in module context or global', () => {
    const firstController = app.get(FirstController)!;
    assertInstanceOf(firstController.child1, Child1);
    assertInstanceOf(firstController.child2, Child2);
  });

  await testContext.step('it throws if controllers dependencies are not available in context or globally', () => {
    const failingApp = new DeNestApplication();
    assertThrows(() => failingApp.bootstrap(ModuleWithMissingProvider));
  });
});
