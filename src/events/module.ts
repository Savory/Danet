import { OnAppBootstrap, OnAppClose } from '../hook/interfaces.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { InjectableConstructor, injector, Logger, Module } from '../mod.ts';
import { eventListenerMetadataKey } from './constants.ts';
import { EventEmitter } from './events.ts';

@Module({
	injectables: [EventEmitter],
})
export class EventEmitterModule implements OnAppBootstrap, OnAppClose {
	private logger: Logger = new Logger('EventEmitterModule');

	constructor() {}

	onAppBootstrap(): void | Promise<void> {
		for (const types of injector.resolvedTypes.values()) {
			this.registerAvailableEventListeners(types);
		}
	}

	onAppClose() {
		const emitter = injector.get<EventEmitter>(EventEmitter);
		emitter.unsubscribe();
	}

	private registerAvailableEventListeners(Type: InjectableConstructor) {
		const methods = Object.getOwnPropertyNames(Type.prototype);

		for (const method of methods) {
			const target = Type.prototype[method];
			const eventListenerMedatada = MetadataHelper.getMetadata<
				{ channel: string }
			>(
				eventListenerMetadataKey,
				target,
			);
			if (!eventListenerMedatada) continue;
			const { channel } = eventListenerMedatada;

			const emitter = injector.get<EventEmitter>(EventEmitter);
			emitter.subscribe(channel, target);
			this.logger.log(`registering method '${method}' to event '${channel}'`);
		}
	}
}
