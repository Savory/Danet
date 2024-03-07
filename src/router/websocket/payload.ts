export interface WebSocketPayload<T = unknown> {
	topic: string;
	data: T;
}
