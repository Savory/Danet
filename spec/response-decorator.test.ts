import { All, Controller, Delete, Get, HttpCode, Patch, Post, Put } from '../src/router/controller/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { DanetApplication } from '../src/app.ts';
import { assertEquals } from '../src/deps_test.ts';
import { Context, Res } from '../src/router/controller/params/decorators.ts';
import type { ExecutionContext } from '../src/mod.ts';

@Controller('nice-controller')
class SimpleController {
    @Get('/')
    simpleGet() {
        return new Response('OK GET', { status: 201 });
    }

    @Get('blob')
    blobWithHeaders() {
        const blob = new Blob(['hello blob'], { type: 'text/plain' });
        return new Response(blob, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Disposition': 'attachment; filename="hello.txt"',
                'X-Custom-Header': 'from-response',
            },
        });
    }

    @Get('with-res')
    setHeaderWithRes(@Res() res: Response) {
        res.headers.set('X-Custom-Header', 'from-res');
        return { ok: true };
    }

    @Get('with-context')
    setBodyWithContext(@Context() ctx: ExecutionContext) {
        const data = new TextEncoder().encode('hello context');
        ctx.header('X-Custom-Header', 'from-context');
        return ctx.body(data);
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

Deno.test('returning a Response with a Blob body sets body and headers', async () => {
    const app = new DanetApplication();
    await app.init(MyModule);
    const listenEvent = await app.listen(0);

    const res = await fetch(
        `http://localhost:${listenEvent.port}/nice-controller/blob`,
        {
            method: 'GET',
        },
    );
    assertEquals(await res.text(), 'hello blob');
    assertEquals(res.status, 200);
    assertEquals(res.headers.get('Content-Type'), 'text/plain');
    assertEquals(
        res.headers.get('Content-Disposition'),
        'attachment; filename="hello.txt"',
    );
    assertEquals(res.headers.get('X-Custom-Header'), 'from-response');
    await app.close();
});

Deno.test('@Res lets you set headers while returning a value', async () => {
    const app = new DanetApplication();
    await app.init(MyModule);
    const listenEvent = await app.listen(0);

    const res = await fetch(
        `http://localhost:${listenEvent.port}/nice-controller/with-res`,
        {
            method: 'GET',
        },
    );
    assertEquals(await res.json(), { ok: true });
    assertEquals(res.headers.get('X-Custom-Header'), 'from-res');
    await app.close();
});

Deno.test('@Context lets you set the body and headers', async () => {
    const app = new DanetApplication();
    await app.init(MyModule);
    const listenEvent = await app.listen(0);

    const res = await fetch(
        `http://localhost:${listenEvent.port}/nice-controller/with-context`,
        {
            method: 'GET',
        },
    );
    assertEquals(await res.text(), 'hello context');
    assertEquals(res.headers.get('X-Custom-Header'), 'from-context');
    await app.close();
});
