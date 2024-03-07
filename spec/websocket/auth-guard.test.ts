import {
	AuthGuard,
	DanetApplication,
	ExecutionContext,
	ExpectationFailedException,
	Injectable,
	Module,
	UseGuard,
} from '../../mod.ts';
import { assertEquals } from '../../src/deps_test.ts';
import {
	OnWebSocketMessage,
	WebSocketController,
} from '../../src/router/websocket/decorator.ts';

@Injectable()
class ExampleAuthGuard implements AuthGuard {
	async canActivate(context: ExecutionContext) {
		if (context.req.query('token') !== 'goodToken') {
			return false;
		}
		return true;
	}
}

@Injectable()
class ControllerGuard implements AuthGuard {
	async canActivate(context: ExecutionContext) {
		if (context.websocketMessage.secret === 'whateversecret') {
			return true;
		}
		return false;
	}
}

@Injectable()
class ExampleService {
	sayHello() {
		return 'coucou';
	}
}

@UseGuard(ExampleAuthGuard)
@WebSocketController('ws')
class ExampleController {
	constructor(private service: ExampleService) {
	}

	@UseGuard(ControllerGuard)
	@OnWebSocketMessage('hello')
	sayHello() {
		return { topic: 'hello', data: this.service.sayHello() };
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

		const unauthorizedWebsocket = new WebSocket(
			`ws://localhost:${listenEvent.port}/ws?token=notagoodtoken`,
		);
		unauthorizedWebsocket.onclose = (e) => {
			assertEquals(e.reason, 'Unauthorized');
		};

		const missingSecretwebsocket = new WebSocket(
			`ws://localhost:${listenEvent.port}/ws?token=goodToken`,
		);
		missingSecretwebsocket.onopen = (e) => {
			missingSecretwebsocket.send(
				JSON.stringify({ topic: 'hello', data: { secret: 'notagoodsecret' } }),
			);
		};
		missingSecretwebsocket.onclose = (e) => {
			assertEquals(e.reason, 'Unauthorized');
		};
		const websocket = new WebSocket(
			`ws://localhost:${listenEvent.port}/ws?token=goodToken`,
		);
		websocket.onmessage = async (e) => {
			const parsedResponse = JSON.parse(e.data);
			assertEquals(parsedResponse.topic, 'hello');
			assertEquals(parsedResponse.data, 'coucou');
			await app.close();
			websocket.close();
			resolve();
		};
		websocket.onopen = (e) => {
			websocket.send(
				JSON.stringify({ topic: 'hello', data: { secret: 'whateversecret' } }),
			);
		};
	});
});
