import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Response } from 'https://deno.land/x/oak@v10.5.1/response.ts';
import { DanetApplication } from '../src/app.ts';
import { Catch, UseFilter } from '../src/exception/filter/decorator.ts';
import { ExceptionFilter } from '../src/exception/filter/interface.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { Query, Res } from '../src/router/controller/params/decorators.ts';
import { HttpContext } from '../src/router/router.ts';

class CustomException extends Error {
  public customField = 'i am a custom field';
  constructor(text: string) {
    super(text);
  }
}

class ErrorFilter implements ExceptionFilter {
  catch(exception: any, context: HttpContext) {
    context.response.body = {
      wePassedInFilterCatchingAllErrors: true,
    };
  }
}

@Catch(CustomException)
class CustomErrorFilter implements ExceptionFilter {
  catch(exception: any, context: HttpContext) {
    context.response.body = {
      wePassedInFilterCatchingOnlySomeError: true,
    };
  }
}

@UseFilter(ErrorFilter)
@Controller('')
class ControllerWithFilter {

  @Get('/')
  simpleGet() {
    throw Error('an error');
  }
}

@Controller('custom-error')
class ControllerWithCustomFilter {
  @UseFilter(CustomErrorFilter)
  @Get('')
  customError() {
    throw new CustomException('an error');
  }

  @Get('unexpected-error')
  unexpectedError() {
    throw Error('unexpected');
  }
}
@Module({
  controllers: [ControllerWithFilter, ControllerWithCustomFilter]
})
class ModuleWithFilter {}

for (const testName of ['Exception Filter with @Catch catch related errors', 'Method exception filter works']) {
  Deno.test(testName, async () => {
    const app = new DanetApplication();
    const port = Math.round(Math.random() * 10000);
    await app.init(ModuleWithFilter);
    app.listen(port);

    const res = await fetch(`http://localhost:${port}/custom-error`, {
      method: 'GET',
    });
    const json = await res.json();
    assertEquals(json, {
      wePassedInFilterCatchingOnlySomeError: true,
    });
    await app.close();
  });
}

Deno.test('Controller filter works', async () => {
  const app = new DanetApplication();
  const port = Math.round(Math.random() * 10000);
  await app.init(ModuleWithFilter);
  app.listen(port);

  const res = await fetch(`http://localhost:${port}`, {
    method: 'GET',
  });
  const json = await res.json();
  assertEquals(json, {
    wePassedInFilterCatchingAllErrors: true,
  });
  await app.close();
});

Deno.test('throw 500 on unexpected error', async () => {
  const app = new DanetApplication();
  const port = Math.round(Math.random() * 10000);
  await app.init(ModuleWithFilter);
  app.listen(port);

  const res = await fetch(`http://localhost:${port}/custom-error/unexpected-error`, {
    method: 'GET',
  });
  assertEquals(500, res.status);
  const json = await res.json();
  await app.close();
});

