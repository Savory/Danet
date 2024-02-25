import { OnAppBootstrap, OnAppClose } from '../hook/interfaces.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { injector, Logger, Module } from '../mod.ts';
import { KV_QUEUE_NAME, queueListenerMetadataKey } from './constants.ts';
import { KvQueue } from './kv.ts';

@Module({})
export class KvQueueModule implements OnAppBootstrap {
	private logger: Logger = new Logger('QueueModule');

	constructor() {}

	public static forRoot(kvName?: string) {
		return {
			injectables: [{ token: KV_QUEUE_NAME, useValue: kvName }, KvQueue],
			module: KvQueueModule,
		}
	}

	async onAppBootstrap(): Promise<void> {
		for (const instanceOrPlainValue of injector.injectables) {
			if (!MetadataHelper.IsObject(instanceOrPlainValue)) {
				continue;
			}
			this.registerAvailableEventListeners(instanceOrPlainValue);
		}
	}

	// deno-lint-ignore no-explicit-any
	private registerAvailableEventListeners(injectableInstance: any) {
		const methods = Object.getOwnPropertyNames(
			injectableInstance.constructor.prototype,
		);
		const queue = injector.get<KvQueue>(KvQueue);

		for (const method of methods) {
			const target = injectableInstance[method];
			const queueListenerMetadata = MetadataHelper.getMetadata<
				{ channel: string }
			>(
				queueListenerMetadataKey,
				target,
			);
			if (!queueListenerMetadata) continue;
			const { channel } = queueListenerMetadata;

			queue.addListener(channel, target);
			this.logger.log(
				`registering method '${method}' to queue channel '${channel}'`,
			);
		}
		queue.attachListeners();
	}
}
