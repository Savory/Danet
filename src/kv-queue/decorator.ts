import { MetadataHelper } from '../metadata/mod.ts';
import { queueListenerMetadataKey } from './constants.ts';

export const OnQueueMessage = (channel: string): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata(
			queueListenerMetadataKey,
			{ channel },
			descriptor.value,
		);
		return descriptor;
	};
};
