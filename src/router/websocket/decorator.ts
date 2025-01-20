import { SetMetadata } from '../../metadata/decorator.ts';

export function WebSocketController(endpoint = ''): MethodDecorator {
	return SetMetadata('websocket-endpoint', endpoint);
}

export function OnWebSocketMessage(topic: string): MethodDecorator {
	return SetMetadata('websocket-topic', topic);
}
