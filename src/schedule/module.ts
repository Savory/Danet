import { OnAppBootstrap, OnAppClose } from '../hook/interfaces.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { InjectableConstructor, injector, Logger, Module } from '../mod.ts';
import {
	intervalMetadataKey,
	scheduleMetadataKey,
	timeoutMetadataKey,
} from './constants.ts';
import {
	CronMetadataPayload,
	IntervalMetadataPayload,
	TimeoutMetadataPayload,
} from './types.ts';

/* Use this module if you want to run CRON https://danet.land/techniques/task-scheduling.html */

@Module({})
export class ScheduleModule implements OnAppBootstrap, OnAppClose {
	private logger: Logger = new Logger('ScheduleModule');
	private abortController = new AbortController();
	private intervalSet = new Set<number>();
	private timeoutSet = new Set<number>();

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

		for (const timeoutId of this.timeoutSet) {
			clearTimeout(timeoutId);
		}
	}

	private registerAvailableEventListeners(Type: InjectableConstructor) {
		const methods = Object.getOwnPropertyNames(Type.constructor.prototype);

		for (const method of methods) {
			this.registerCronJobs(Type, method);
			this.registerIntervals(Type, method);
			this.registerTimeouts(Type, method);
		}
	}

	private registerTimeouts(
		injectableInstance: InjectableConstructor,
		method: string,
	) {
		this.registerTimedEvents<TimeoutMetadataPayload>(
			timeoutMetadataKey,
			injectableInstance,
			method,
			({ timeout }, callback) => {
				this.logger.log(
					`Scheduling '${method}' to run as a timeout callback`,
				);

				this.timeoutSet.add(setTimeout(callback, timeout));
			},
		);
	}

	private registerIntervals(
		injectableInstance: InjectableConstructor,
		method: string,
	) {
		this.registerTimedEvents<IntervalMetadataPayload>(
			intervalMetadataKey,
			injectableInstance,
			method,
			({ interval }, callback) => {
				this.logger.log(
					`Scheduling '${method}' to run as a interval callback`,
				);

				this.intervalSet.add(setInterval(callback, interval));
			},
		);
	}

	private registerCronJobs(
		injectableInstance: InjectableConstructor,
		method: string,
	) {
		this.registerTimedEvents<CronMetadataPayload>(
			scheduleMetadataKey,
			injectableInstance,
			method,
			({ cron }, callback) => {
				this.logger.log(`Scheduling '${method}' to run as a cron job`);
				Deno.cron(method, cron, this.abortController, callback);
			},
		);
	}

	private registerTimedEvents<T>(
		metadataKey: string,
		injectableInstance: InjectableConstructor,
		method: string,
		handler: (metadata: T, cb: () => void) => void,
	) {
		const target = injectableInstance.constructor.prototype[method];
		const metadata = MetadataHelper.getMetadata<T>(metadataKey, target);
		if (!metadata) return;

		const callback = this.makeCallbackWithScope(injectableInstance, target);
		handler(metadata, callback);
	}

	// Function to ensures we don't lose `this` scope from target
	// deno-lint-ignore no-explicit-any
	private makeCallbackWithScope(instance: any, target: any) {
		return () => instance[target.name]();
	}
}
