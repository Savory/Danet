import { SetMetadata } from '../../metadata/decorator.ts';

export const WebSocketController = (endpoint = '') =>
	SetMetadata('websocket-endpoint', endpoint);

export const OnWebSocketMessage = (topic: string) => SetMetadata('websocket-topic', topic);