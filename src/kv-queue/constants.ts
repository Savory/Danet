export const queueListenerMetadataKey = 'queue-listener';

export const KV_QUEUE_NAME = 'KV_QUEUE_NAME';

// deno-lint-ignore no-explicit-any
export type QueueEvent<T = any> = {
	type: string;
	data: T;
};
