import { OnAppBootstrap, OnAppClose } from '../hook/interfaces.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { InjectableConstructor, injector, Logger, Module } from '../mod.ts';
import { scheduleMetadataKey } from './constants.ts';
import { CronMetadataPayload } from './types.ts';

@Module({})
export class ScheduleModule implements OnAppBootstrap, OnAppClose {
	private logger: Logger = new Logger('ScheduleModule');
	private abortController = new AbortController();

	onAppBootstrap() {
		for (const types of injector.injectables) {
			this.registerAvailableEventListeners(types);
		}
	}

	onAppClose() {
		this.logger.log(`Aborting all scheduled events`);
		this.abortController.abort();
	}

	private registerAvailableEventListeners(Type: InjectableConstructor) {
		const methods = Object.getOwnPropertyNames(Type.constructor.prototype);

		for (const method of methods) {
			const target = Type.constructor.prototype[method];
			const scheduleMedatada = MetadataHelper.getMetadata<CronMetadataPayload>(
				scheduleMetadataKey,
				target,
			);
			if (!scheduleMedatada) continue;
			const { cron } = scheduleMedatada;

			this.logger.log(`Scheduling '${target.name}' to run on '${cron}'`);
			const callback = this.makeCallbackWithScope(Type, target);
			Deno.cron(target.name, cron, this.abortController, callback);
		}
	}

	// Function to ensures we don't lose `this` scope from target
	// deno-lint-ignore no-explicit-any
	private makeCallbackWithScope(instance: any, target: any) {
		return () => instance[target.name]();
	}
}
