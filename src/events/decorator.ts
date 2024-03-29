import { MetadataHelper } from '../metadata/mod.ts';
import { eventListenerMetadataKey } from './constants.ts';

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
