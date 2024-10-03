import { SetMetadata } from '../metadata/decorator.ts';
import {
	intervalMetadataKey,
	scheduleMetadataKey,
	timeoutMetadataKey,
} from './constants.ts';
import { CronString } from './types.ts';

/**
 * Assigns a cron schedule to a method. The method will be executed according to the provided cron schedule.
 *
 * @param cron - A string representing the cron schedule.
 * @returns A method decorator that sets the metadata key with the provided cron schedule.
 */
export const Cron = (cron: CronString): MethodDecorator =>
	SetMetadata(scheduleMetadataKey, { cron });

/**
 * Method will be executed at a specified interval.
 *
 * @param interval - The interval in milliseconds at which the method should be executed.
 * @returns A method decorator that sets the interval metadata.
 */
export const Interval = (interval: number): MethodDecorator =>
	SetMetadata(intervalMetadataKey, { interval });

/**
 * Execute Method after X milliseconds.
 *
 * @param timeout - The timeout duration in milliseconds.
 * @returns A method decorator that sets the timeout metadata.
 */
export const Timeout = (timeout: number): MethodDecorator =>
	SetMetadata(timeoutMetadataKey, { timeout });
