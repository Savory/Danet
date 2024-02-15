import { Logger, Module, ModuleConstructor } from '../mod.ts';

// deno-lint-ignore no-explicit-any
type Listener<P = any> = (payload: P) => void;

// deno-lint-ignore no-explicit-any
export class EventEmitter<T = any> {
	private logger: Logger = new Logger('EventEmitter');
	private listenersMap: Map<string, Listener<T>[]>;

	constructor() {
		this.listenersMap = new Map<string, Listener[]>();
	}

	emmit(channelName: string, payload: T) {
		const listeners = this.getListeners(channelName);

		if (listeners.length === 0) {
			this.logger.warn(`No listener subscribed for channel '${channelName}'`);
		}

		listeners.map((listener) => {
			listener(payload);
		});
	}

	subscribe(channelName: string, listener: Listener) {
		const listeners = this.getListeners(channelName);
		this.listenersMap.set(channelName, [...listeners, listener]);
	}

	unsubscribe(channelName: string) {
		this.listenersMap.delete(channelName);
	}

	private getListeners(channelName: string) {
		return this.listenersMap.get(channelName) ?? [];
	}

	static forRoot(): ModuleConstructor {
		const moduleDecorator = Module({
			injectables: [EventEmitter],
		});
		class Events {}

		moduleDecorator(Events);
		return Events;
	}
}
