import { DanetApplication, Module, Injectable, AuthGuard, ExecutionContext, UseGuard, ExpectationFailedException, Body, Param } from '../../mod.ts';
import { assertEquals } from '../../src/deps_test.ts';
import { OnWebSocketMessage, WebSocketController } from '../../src/router/websocket/decorator.ts';

@WebSocketController('ws')
class ExampleController {

    constructor() {

    }

    @OnWebSocketMessage('hello')
    sayHello(@Body() whateverIsSent: any) {
        return { topic: 'hello', data: whateverIsSent};
    }

    @OnWebSocketMessage('hello/:name')
    sayHelloWithName(@Param('name') name: string) {
        return { topic: 'hello', data: name};
    }

}


@Module({
    controllers: [ExampleController],
    injectables: [],
})
class ExampleModule {}


Deno.test('Body', async () => {
    return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(ExampleModule);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/ws?token=goodToken`);
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
            assertEquals(parsedResponse.topic, 'hello');
            assertEquals(parsedResponse.data.didIGetThisBack, true);
            await app.close();
            websocket.close();
            resolve();
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'hello', data: { didIGetThisBack: true }}))
        };
    
    });
});


Deno.test('Param', async () => {
    return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(ExampleModule);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/ws?token=goodToken`);
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
            assertEquals(parsedResponse.topic, 'hello');
            assertEquals(parsedResponse.data, 'thomas');
            await app.close();
            websocket.close();
            resolve();
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'hello/thomas', data: 'unrelevant'}))
        };
    
    });
});