import { MetadataHelper } from '../metadata/mod.ts';
import { intervalMetadataKey, scheduleMetadataKey } from './constants.ts';
import { CronString } from './types.ts';

export const Cron = (cron: CronString): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata(
			scheduleMetadataKey,
			{ cron },
			descriptor.value,
		);
		return descriptor;
	};
};

export const Interval = (interval: number): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata(
			intervalMetadataKey,
			{ interval },
			descriptor.value,
		);
		return descriptor;
	};
};
