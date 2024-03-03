import { assertEquals } from '../../src/deps_test.ts';
import { DanetApplication } from '../../src/app.ts';
import { Module } from '../../src/module/decorator.ts';
import { Controller, Get } from '../../src/router/controller/decorator.ts';
import { Injectable } from '../../src/injector/injectable/decorator.ts';
import { ExecutionContext } from '../../src/router/router.ts';
import {
	DanetMiddleware,
	Middleware,
	NextFunction,
} from '../../src/router/middleware/decorator.ts';
import { BadRequestException } from '../../src/exception/http/exceptions.ts';
import { WebSocketController } from '../../src/router/websocket/decorator.ts';
import { OnWebSocketMessage } from '../../src/router/websocket/decorator.ts';

@Injectable()
class SimpleInjectable {
	doSomething() {
		return 'I did something';
	}
}

@Injectable()
class SimpleMiddleware implements DanetMiddleware {
	constructor(private simpleInjectable: SimpleInjectable) {
	}

	async action(ctx: ExecutionContext, next: NextFunction) {
		ctx.websocket?.send(JSON.stringify({ topic: 'simple-middle', data: this.simpleInjectable.doSomething() }));
		await next();
	}
}

const secondMiddleware = async (ctx: ExecutionContext, next: NextFunction) => {
	ctx.websocket?.send(JSON.stringify({ topic: 'second-middle', data: 'more' }));
	await next();
};

@WebSocketController('simple-controller')
class SimpleController {
	@OnWebSocketMessage('trigger')
	@Middleware(SimpleMiddleware)
	getWithMiddleware() {
	}
}

@Middleware(SimpleMiddleware, secondMiddleware)
@WebSocketController('controller-with-middleware')
class ControllerWithMiddleware {
	@OnWebSocketMessage('trigger')
	getWithoutMiddleware() {
	}
}

@Module({
	controllers: [SimpleController, ControllerWithMiddleware],
	injectables: [SimpleInjectable],
})
class MyModule {}

Deno.test('Middleware method decorator', async () => {
	return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(MyModule);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/simple-controller`);
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
            assertEquals(parsedResponse.topic, 'simple-middle');
            assertEquals(parsedResponse.data, 'I did something');
            await app.close();
            websocket.close();
            resolve();
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'trigger', data: { didIGetThisBack: true }}))
        };
    
    });
});

Deno.test('Middleware controller decorator', async () => {
	return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(MyModule);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/controller-with-middleware`);
		let numberOfReceivedMessage = 0;
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
			if (parsedResponse.topic === 'simple-middle') {
				assertEquals(parsedResponse.data, 'I did something');
				numberOfReceivedMessage++;
			}
			else {
				assertEquals(parsedResponse.topic, 'second-middle');
				assertEquals(parsedResponse.data, 'more');
				assertEquals(numberOfReceivedMessage, 1);
				await app.close();
				websocket.close();
				resolve();
			}
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'trigger', data: { didIGetThisBack: true }}))
        };
    
    });
});

@Injectable()
class FirstGlobalMiddleware implements DanetMiddleware {
	async action(ctx: ExecutionContext, next: NextFunction) {
		ctx.websocket?.send(JSON.stringify({ topic: 'first-middleware', data: 'its me' }));
		return await next();
	}
}

@Injectable()
class SecondGlobalMiddleware implements DanetMiddleware {
	async action(ctx: ExecutionContext, next: NextFunction) {
		ctx.websocket?.send(JSON.stringify({ topic: 'second-middleware', data: 'mario' }));
		return await next();
	}
}

Deno.test('Global middlewares', async () => {
	return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(MyModule);
		app.addGlobalMiddlewares(FirstGlobalMiddleware, SecondGlobalMiddleware);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/controller-with-middleware`);
		let numberOfReceivedMessage = 0;
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
			if (parsedResponse.topic === 'simple-middle') {
				assertEquals(parsedResponse.data, 'I did something');
				numberOfReceivedMessage++;
			}
		 	else if (parsedResponse.topic === 'first-middleware') {
				assertEquals(parsedResponse.data, 'its me');
				numberOfReceivedMessage++;
			} else if (parsedResponse.topic === 'second-middleware') {
				assertEquals(parsedResponse.data, 'mario');
				numberOfReceivedMessage++;
			 } else {
				assertEquals(parsedResponse.data, 'more');
				assertEquals(numberOfReceivedMessage, 3);
				await app.close();
				websocket.close();
				resolve();
			}
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'trigger', data: { didIGetThisBack: true }}))
        };
    
    });
});
