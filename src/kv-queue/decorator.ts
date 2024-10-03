import { MetadataHelper } from '../metadata/mod.ts';
import { queueListenerMetadataKey } from './constants.ts';

/**
 * Method decorator that registers a method as a listener for a specific queue channel.
 *
 * @param channel - The name of the queue channel to listen to.
 * @returns A method decorator function.
 */
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
