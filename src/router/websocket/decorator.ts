import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';

export function WebSocketController(endpoint = ''): MetadataFunction {
	return SetMetadata('websocket-endpoint', endpoint);
}

export function OnWebSocketMessage(topic: string): MetadataFunction {
	return SetMetadata('websocket-topic', topic);
}
