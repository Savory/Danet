import { SetMetadata } from '../../metadata/decorator.ts';

export const WebSocketController: MappingDecoratorFunction = (endpoint = '') =>
	SetMetadata('websocket-endpoint', endpoint);

export const OnWebSocketMessage: MappingDecoratorFunction = (topic: string) =>
	SetMetadata('websocket-topic', topic);
