// deno-lint-ignore-file no-explicit-any

import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Response, Request } from 'https://deno.land/x/oak@v9.0.1/mod.ts';
import { Controller, Get, Post } from './controller/decorator.ts';
import { Body, Param, Req, Res } from './controller/params/decorators.ts';
import { DanetRouter } from './router.ts';

Deno.test('router.handleRoute inject params into method', async (testContext) => {
  const router = new DanetRouter();

  @Controller('my-path')
  class MyController {
    @Get('/')
    testResFunction(@Res() res: Response) {
      res.body = 'managed to get it'
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

    @Post('/:id')
    testQueryParam(@Param('id') id: string) {
      return id;
    }

  }
  const context = { response : { body: ''}, request: {  url : { searchParams: new Map([['id', 3]])}, body: { whatisit: 'testbody' }}};

  await testContext.step('@Res decorator works', async () => {
    await router.handleRoute(MyController, MyController.prototype.testResFunction)(context as any);
    assertEquals(context.response.body, 'managed to get it');

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

})
