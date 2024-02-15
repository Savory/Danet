import { OnAppClose } from '../hook/interfaces.ts';
import { Logger, Module } from '../mod.ts';

// deno-lint-ignore no-explicit-any
type Listener<P = any> = (payload: P) => void;

export class EventEmitter implements OnAppClose {
	private logger: Logger = new Logger('EventEmitter');
	private listenersRegistered: Array<[string, Listener]>;
	private eventTarget: EventTarget;

	constructor() {
		this.listenersRegistered = [];
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
		this.listenersRegistered.push([channelName, listener]);

		this.logger.log(
			`event listener subscribed to '${channelName}' channel`,
		);
	}

	unsubscribe(channelName?: string) {
		let unsubscribeListeners = this.listenersRegistered;
		if (channelName) {
			unsubscribeListeners = this.listenersRegistered.filter((
				[channel, _listener],
			) => channelName == channel);
		}

		this.logger.log(
			`cleaning up event listeners for '${channelName ?? 'all'}' channel`,
		);

		return unsubscribeListeners.map((item) =>
			this.eventTarget.removeEventListener(...item)
		);
	}

	onAppClose() {
		this.unsubscribe();
	}
}

@Module({
	injectables: [EventEmitter],
})
export class EventEmitterModule {}
