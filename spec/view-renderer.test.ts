import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import * as path from "https://deno.land/std@0.135.0/path/mod.ts";
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Render } from '../src/renderer/decorator.ts';
import {
  Controller,
  Get,
} from '../src/router/controller/decorator.ts';

@Controller('nice-controller')
class SimpleController {
  @Render('index')
  @Get('/')
  simpleGet() {
    return { title: 'my title' };
  }
}

@Module({
  controllers: [SimpleController],
})
class MyModule {}

Deno.test('Hbs renderer', async () => {
  const app = new DanetApplication();
  await app.init(MyModule);
  const viewPath = path.dirname(path.fromFileUrl(import.meta.url)) + '/views';
  app.setViewEngineDir(viewPath);
  const port = (await app.listen(0)).port;

    const res = await fetch(`http://localhost:${port}/nice-controller`, {
      method: 'GET',
    });
    const text = await res.text();
    console.log(text);
    assertEquals(text.includes('my title'), true);
  await app.close();
});
