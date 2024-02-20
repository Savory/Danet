import { SetMetadata } from '../metadata/decorator.ts';
import {
	intervalMetadataKey,
	scheduleMetadataKey,
	timeoutMetadataKey,
} from './constants.ts';
import { CronString } from './types.ts';

export const Cron = (cron: CronString): MethodDecorator =>
	SetMetadata(scheduleMetadataKey, { cron });

export const Interval = (interval: number): MethodDecorator =>
	SetMetadata(intervalMetadataKey, { interval });

export const Timeout = (timeout: number): MethodDecorator =>
	SetMetadata(timeoutMetadataKey, { timeout });
