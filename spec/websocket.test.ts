import { DanetApplication, Module, Injectable } from '../mod.ts';
import { assertEquals } from '../src/deps_test.ts';
import { OnWebSocketMessage, WebSocketController } from '../src/router/websocket/decorator.ts';

@Injectable()
class ExampleService {

    sayHello() {
        return 'coucou';
    }

}

@WebSocketController('ws')
class ExampleController {

    constructor(private service: ExampleService) {

    }

    @OnWebSocketMessage('hello')
    sayHello() {
        return { topic: 'hello', data: this.service.sayHello()};
    }
}


@Module({
    controllers: [ExampleController],
    injectables: [ExampleService],
})
class ExampleModule {}


Deno.test('Websocket', async () => {
    return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(ExampleModule);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/ws`,);
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
            assertEquals(parsedResponse.topic, 'hello');
            assertEquals(parsedResponse.data, 'coucou');
            await app.close();
            websocket.close();
            resolve();
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'hello'}))
        };
    
    });
});