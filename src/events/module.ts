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
		for (const instance of injector.injectables) {
			this.registerAvailableEventListeners(instance);
		}
	}

	onAppClose() {
		const emitter = injector.get<EventEmitter>(EventEmitter);
		emitter.unsubscribe();
	}

        // deno-lint-ignore no-explicit-any
	private registerAvailableEventListeners(injectableInstance: any) {
		const methods = Object.getOwnPropertyNames(injectableInstance.constructor.prototype);

		for (const method of methods) {
			const target = injectableInstance[method];
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
