import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { DeNestApplication } from './app.ts';
import { Controller, Get, Post } from './controller/decorator.ts';

Deno.test('register controllers', () => {
  @Controller('controller-endpoint')
  class FirstController {
      @Get('')
      getMethod() {

      }

      @Post('post')
      postMethod() {

      }
  }
  const app = new DeNestApplication();
  app.registerControllers([FirstController]);
  const keys = app.router.keys();
  const firstRouter = keys.next().value;
  assertEquals(firstRouter.path, 'controller-endpoint');
  assertEquals(firstRouter.methods, ['HEAD', 'GET']);
  const secondRouter = keys.next().value;
  assertEquals(secondRouter.path, 'controller-endpoint/post');
  assertEquals(secondRouter.methods, ['POST']);
})
