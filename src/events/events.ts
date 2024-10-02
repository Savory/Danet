import { Logger } from '../mod.ts';

// deno-lint-ignore no-explicit-any
type Listener<P = any> = (payload: P) => void;

/**
 * Provides event-driven architecture for subscribing, emitting, and unsubscribing events.
 *
 * @example
 * ```ts
 * const emitter = new EventEmitter();
 *
 * // Subscribe to an event
 * emitter.subscribe('eventName', (payload) => {
 *   console.log(payload);
 * });
 *
 * // Emit an event
 * emitter.emit('eventName', { key: 'value' });
 *
 * // Unsubscribe from an event
 * emitter.unsubscribe('eventName');
 * ```
 */
export class EventEmitter {
	private logger: Logger = new Logger('EventEmitter');
	private listenersRegistered: Map<string, Listener[]>;
	private eventTarget: EventTarget;

	constructor() {
		this.listenersRegistered = new Map();
		this.eventTarget = new EventTarget();
	}

	/**
	 * Emits an event to a specified channel with the given payload.
	 *
	 * @template P - The type of the payload.
	 * @param {string} channelName - The name of the channel to emit the event to.
	 * @param {P} payload - The payload to send with the event.
	 * @throws {Error} If there is no listener registered for the specified channel.
	 * @returns {void}
	 */
	emit<P>(channelName: string, payload: P): void {
		const channels = Array.from(this.listenersRegistered.keys());
		if (!channels.includes(channelName)) {
			throw new Error(`No listener for '${channelName}' channel`);
		}

		const event = new CustomEvent(channelName, { detail: payload });
		this.eventTarget.dispatchEvent(event);

		this.logger.log(
			`event send to '${channelName}' channel`,
		);
	}

	/**
	 * Subscribes a listener to a specified event channel.
	 *
	 * @template P - The type of the payload expected by the listener.
	 * @param {string} channelName - The name of the event channel to subscribe to.
	 * @param {Listener<P>} listener - The listener function to be called when an event is emitted on the specified channel.
	 * @returns {void}
	 */
	subscribe<P>(channelName: string, listener: Listener<P>): void {
		const eventListener = (ev: Event) => {
			const { detail: payload } = ev as CustomEvent;
			return listener(payload);
		};
		this.eventTarget.addEventListener(channelName, eventListener);

		const listeners = this.listenersRegistered.get(channelName) ?? [];
		this.listenersRegistered.set(channelName, [...listeners, eventListener]);

		this.logger.log(
			`event listener subscribed to '${channelName}' channel`,
		);
	}

	/**
	 * Unsubscribes from event listeners for a specific channel or all channels.
	 *
	 * @param channelName - The name of the channel to unsubscribe from. If not provided, unsubscribes from all channels.
	 * @returns void
	 */
	unsubscribe(channelName?: string): void {
		this.logger.log(
			`cleaning up event listeners for '${channelName ?? 'all'}' channel`,
		);

		if (channelName) {
			return this.deleteChannel(channelName);
		}

		for (const channel of this.listenersRegistered.keys()) {
			this.deleteChannel(channel);
		}
	}

	private deleteChannel(channelName: string) {
		const listeners = this.listenersRegistered.get(channelName) ?? [];

		listeners.map((listener) =>
			this.eventTarget.removeEventListener(channelName, listener)
		);

		this.listenersRegistered.delete(channelName);
	}
}
