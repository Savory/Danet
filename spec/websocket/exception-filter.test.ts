import { assertEquals } from '../../src/deps_test.ts';
import { DanetApplication } from '../../src/app.ts';
import { Catch, UseFilter } from '../../src/exception/filter/decorator.ts';
import { ExceptionFilter } from '../../src/exception/filter/interface.ts';
import { Module } from '../../src/module/decorator.ts';
import { Get } from '../../src/router/controller/decorator.ts';
import { HttpContext } from '../../src/router/router.ts';
import { Injectable } from '../../src/injector/injectable/decorator.ts';
import { OnWebSocketMessage, WebSocketController } from '../../src/router/websocket/decorator.ts';

@Injectable()
class SimpleService {
	private a = 0;
	doSomething() {
		this.a++;
	}
}

class CustomException extends Error {
	public customField = 'i am a custom field';
	constructor(text: string) {
		super(text);
	}
}

@Injectable()
class ErrorFilter implements ExceptionFilter {
	constructor(private simpleService: SimpleService) {
	}

	catch(exception: any, context: HttpContext) {
		this.simpleService.doSomething();
		return { topic: 'catch-all', data: 'nicely-done' };
	}
}

@Injectable()
@Catch(CustomException)
class CustomErrorFilter implements ExceptionFilter {
	constructor(private simpleService: SimpleService) {
	}

	catch(exception: any, context: HttpContext) {
		this.simpleService.doSomething();
		return { topic: 'catch-custom', data: 'nicely-done' };
	}
}

@UseFilter(ErrorFilter)
@WebSocketController('catch-all')
class ControllerWithFilter {
	@OnWebSocketMessage('trigger')
	simpleGet() {
		throw Error('an error');
	}
}

@WebSocketController('custom-error')
class ControllerWithCustomFilter {
	@UseFilter(CustomErrorFilter)
	@OnWebSocketMessage('trigger')
	customError() {
		throw new CustomException('an error');
	}

	@OnWebSocketMessage('unexpected')
	unexpectedError() {
		throw Error('unexpected');
	}
}
@Module({
	controllers: [ControllerWithFilter, ControllerWithCustomFilter],
	injectables: [SimpleService],
})
class ModuleWithFilter {}

Deno.test('Catch all', async () => {
    return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(ModuleWithFilter);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/catch-all`);
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
            assertEquals(parsedResponse.topic, 'catch-all');
            assertEquals(parsedResponse.data, 'nicely-done');
            await app.close();
            websocket.close();
            resolve();
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'trigger', data: { didIGetThisBack: true }}))
        };
    
    });
});

Deno.test('Catch custom', async () => {
    return new Promise(async (resolve) => {
        const app = new DanetApplication();
        await app.init(ModuleWithFilter);
        const listenEvent = await app.listen(0);
    
        const websocket = new WebSocket(`ws://localhost:${listenEvent.port}/custom-error`);
        websocket.onmessage = async (e) => {
            const parsedResponse = JSON.parse(e.data);
            assertEquals(parsedResponse.topic, 'catch-custom');
            assertEquals(parsedResponse.data, 'nicely-done');
            await app.close();
            websocket.close();
            resolve();
        };
        websocket.onopen = (e) => {
            websocket.send(JSON.stringify({topic: 'trigger', data: { didIGetThisBack: true }}))
        };
    
    });
});
