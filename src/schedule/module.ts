import { OnAppBootstrap, OnAppClose } from '../hook/interfaces.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { InjectableConstructor, injector, Logger, Module } from '../mod.ts';
import { intervalMetadataKey, scheduleMetadataKey } from './constants.ts';
import { CronMetadataPayload, IntervalMetadataPayload } from './types.ts';

@Module({})
export class ScheduleModule implements OnAppBootstrap, OnAppClose {
	private logger: Logger = new Logger('ScheduleModule');
	private abortController = new AbortController();
	private intervalSet = new Set<number>();

	onAppBootstrap() {
		for (const types of injector.injectables) {
			this.registerAvailableEventListeners(types);
		}
	}

	onAppClose() {
		this.logger.log(`Cleaning up all scheduled events`);
		this.abortController.abort();

		for (const intervalId of this.intervalSet) {
			clearInterval(intervalId);
		}
	}

	private registerAvailableEventListeners(Type: InjectableConstructor) {
		const methods = Object.getOwnPropertyNames(Type.constructor.prototype);

		for (const method of methods) {
			this.registerCronJobs(Type, method);
			this.registerIntervals(Type, method);
		}
	}

	private registerIntervals(Type: InjectableConstructor, method: string) {
		const target = Type.constructor.prototype[method];
		const scheduleMedatada = MetadataHelper.getMetadata<
			IntervalMetadataPayload
		>(
			intervalMetadataKey,
			target,
		);
		if (!scheduleMedatada) return;
		const { interval } = scheduleMedatada;

		this.logger.log(
			`Scheduling '${target.name}' to run as a interval callback`,
		);
		const callback = this.makeCallbackWithScope(Type, target);

		this.intervalSet.add(setInterval(callback, interval));
	}

	private registerCronJobs(Type: InjectableConstructor, method: string) {
		const target = Type.constructor.prototype[method];
		const scheduleMedatada = MetadataHelper.getMetadata<CronMetadataPayload>(
			scheduleMetadataKey,
			target,
		);
		if (!scheduleMedatada) return;
		const { cron } = scheduleMedatada;

		this.logger.log(`Scheduling '${target.name}' to run as a cron job`);
		const callback = this.makeCallbackWithScope(Type, target);
		Deno.cron(target.name, cron, this.abortController, callback);
	}

	// Function to ensures we don't lose `this` scope from target
	// deno-lint-ignore no-explicit-any
	private makeCallbackWithScope(instance: any, target: any) {
		return () => instance[target.name]();
	}
}
