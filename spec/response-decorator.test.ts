import { All, Controller, Delete, Get, HttpCode, Patch, Post, Put } from '../src/router/controller/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { DanetApplication } from '../src/app.ts';
import { assertEquals } from '../src/deps_test.ts';

@Controller('nice-controller')
class SimpleController {
    @Get('/')
    simpleGet() {
        return new Response('OK GET', { status: 201 });
    }
}

@Module({
    controllers: [SimpleController],
})
class MyModule {}

Deno.test('HttpCode', async () => {
    const app = new DanetApplication();
    await app.init(MyModule);
    const listenEvent = await app.listen(0);

    const res = await fetch(
        `http://localhost:${listenEvent.port}/nice-controller`,
        {
            method: 'GET',
        },
    );
    const text = await res.text();
    assertEquals(text, `OK GET`);
    assertEquals(res.status, 201);
    await app.close();
});