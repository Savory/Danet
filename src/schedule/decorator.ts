import { MetadataHelper } from '../metadata/mod.ts';
import { scheduleMetadataKey } from './constants.ts';
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
