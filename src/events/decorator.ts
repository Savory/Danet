import { MetadataHelper } from '../metadata/mod.ts';
import { eventListenerMetadataKey } from './constants.ts';

/**
 * A decorator that registers a method as an event listener for a specified channel.
 *
 * @param channel - The name of the event channel to listen to.
 * @returns A method decorator that registers the method as an event listener.
 */
export const OnEvent = (channel: string): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata(
			eventListenerMetadataKey,
			{ channel },
			descriptor.value,
		);
		return descriptor;
	};
};
