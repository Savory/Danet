import { OnAppClose } from '../hook/interfaces.ts';
import { Logger, Module } from '../mod.ts';

// deno-lint-ignore no-explicit-any
type Listener<P = any> = (payload: P) => void;

export class EventEmitter implements OnAppClose {
	private logger: Logger = new Logger('EventEmitter');
	private listenersRegistered: Map<string, Listener[]>;
	private eventTarget: EventTarget;

	constructor() {
		this.listenersRegistered = new Map();
		this.eventTarget = new EventTarget();
	}

	emmit<P>(channelName: string, payload: P) {
		const event = new CustomEvent(channelName, { detail: payload });
		this.eventTarget.dispatchEvent(event);

		this.logger.log(
			`event send to '${channelName}' channel`,
		);
	}

	subscribe<P>(channelName: string, listener: Listener<P>) {
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

	unsubscribe(channelName?: string) {
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

	onAppClose() {
		this.unsubscribe();
	}

	private deleteChannel(channelName: string) {
		const listeners = this.listenersRegistered.get(channelName) ?? [];

		listeners.map((listener) =>
			this.eventTarget.removeEventListener(channelName, listener)
		);

		this.listenersRegistered.delete(channelName);
	}
}

@Module({
	injectables: [EventEmitter],
})
export class EventEmitterModule {}
