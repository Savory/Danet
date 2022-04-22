import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Response } from 'https://deno.land/x/oak@v9.0.1/response.ts';
import { Get } from './controller/decorator.ts';
import { Res } from './controller/params/decorators.ts';
import { DeNestRouter, HttpContext } from './router.ts';

Deno.test('router.handleRoute inject params into method', async () => {
  const router = new DeNestRouter();
  class Controller {
    @Get('/')
    testFunction(@Res() res: Response) {
      res.body = 'managed to get it'
    }
  }
  const context = { response : { body: ''} };
  await router.handleRoute(Controller, Controller.prototype.testFunction)(context as HttpContext);
  assertEquals(context.response.body, 'managed to get it')
})
