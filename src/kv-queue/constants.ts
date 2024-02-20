export const queueListenerMetadataKey = 'queue-listener';

// deno-lint-ignore no-explicit-any
export type QueueEvent<T = any> = {
    type: string;
    data: T;
}