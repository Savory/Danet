// deno-lint-ignore-file no-explicit-any

import { assertThrowsAsync } from 'https://deno.land/std@0.105.0/testing/asserts.ts';
import { assertEquals, assertThrows } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Response, Request } from 'https://deno.land/x/oak@v9.0.1/mod.ts';
import { GLOBAL_GUARD } from '../guard/constants.ts';
import { UseGuard } from '../guard/decorator.ts';
import { AuthGuard } from '../guard/interface.ts';
import { TokenInjector } from '../injector/injectable/constructor.ts';
import { Injectable } from '../injector/injectable/decorator.ts';
import { Injector } from '../injector/injector.ts';
import { Controller, Get, Post } from './controller/decorator.ts';
import { Body, Param, Query, Req, Res } from './controller/params/decorators.ts';
import { DanetRouter, HttpContext } from './router.ts';

Deno.test('router.handleRoute inject params into method', async (testContext) => {


  @Injectable()
  class GlobalGuard implements AuthGuard {
    canActivate(context: HttpContext): void {
      context.state.globalguardAssignedVariable = 'coucou';
    }
  }

  class ControllerGuard implements AuthGuard  {
    canActivate(context: HttpContext){
      context.state.user = 'coucou';
    }
  }
  class MethodGuard implements AuthGuard  {
    canActivate(context: HttpContext){
      context.state.something = 'coucou';
    }
  }

  @UseGuard(ControllerGuard)
  @Controller('my-path')
  class MyController {
    @Get('/')
    testResFunction(@Res() res: Response, @Query('myvalue') myvalue: string) {
      res.body = {
        myvalue
      };
    }

    @Post('')
    testReqFunction(@Req() req: Request) {
      return req.body;
    }

    @Post('')
    testBodyFunction(@Body('whatisit') niceValue: string) {
      return niceValue;
    }

    @Post('')
    testBodyWithoutParamFunction(@Body() fullBody: string) {
      return fullBody;
    }

    @UseGuard(MethodGuard)
    @Post('/:id')
    testQueryParam(@Param('id') id: string) {
      return id;
    }

    @Post('/:id')
    throwingRoute() {
      throw Error('anerror')
    }
  }
  const injector = new Injector();
  injector.registerInjectables([new TokenInjector(GlobalGuard, GLOBAL_GUARD)]);
  injector.resolveControllers([MyController]);
  const router = new DanetRouter(injector);
  const searchParams = new Map();
  searchParams.set('id', 3);
  searchParams.set('myvalue', 'a nice value');
  const context = { response : { body: '', status: 200}, state: { user: '', something: '', globalguardAssignedVariable: ''}, request: {  url : { searchParams }, body: { whatisit: 'testbody' }}};

  await testContext.step('@Res decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testResFunction)(context as any);
    assertEquals(context.response.body, { myvalue: 'a nice value' });

  })

  await testContext.step('@Req decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testReqFunction)(context as any);
    assertEquals(context.response.body, { whatisit: 'testbody' });
  })

  await testContext.step('@Body with param decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testBodyFunction)(context as any);
    assertEquals(context.response.body, 'testbody');
  });

  await testContext.step('@Body WITHOUT param decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testBodyWithoutParamFunction)(context as any);
    assertEquals(context.response.body, { whatisit: 'testbody' });
  });

  await testContext.step('@Param decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testQueryParam)(context as any);
    assertEquals(context.response.body, 3);
  });

  await testContext.step('@UseAuthGuard controller decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testQueryParam)(context as any);
    assertEquals(context.state.user, "coucou");
  });

  await testContext.step('@UseAuthGuard method\'s decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testQueryParam)(context as any);
    assertEquals(context.state.something, "coucou");
  });

  await testContext.step('Execute global guard', async () => {
    await router.handleRoute(MyController, MyController.prototype.testQueryParam)(context as any);
    assertEquals(context.state.globalguardAssignedVariable, "coucou");
  });

  await testContext.step('answer 500 when there is an unexpected error', async () => {
    await router.handleRoute(MyController, MyController.prototype.throwingRoute)(context as any);
    assertEquals(context.response.status, 500);
  })

})
