import { ControllerConstructor } from '../router/controller/constructor.ts';
import { MetadataHelper } from './helper.ts';

export const SetMetadata = (key: string, value: unknown): (
	// deno-lint-ignore ban-types
	target: ControllerConstructor | Object,
	propertyKey?: string | symbol,
	// deno-lint-ignore no-explicit-any
	descriptor?: TypedPropertyDescriptor<any>,
) => void =>
(
	// deno-lint-ignore ban-types
	target: ControllerConstructor | Object,
	propertyKey?: string | symbol,
	// deno-lint-ignore no-explicit-any
	descriptor?: TypedPropertyDescriptor<any>,
): void => {
	if (propertyKey && descriptor) {
		MetadataHelper.setMetadata(
			key,
			value,
			descriptor.value,
		);
	} else {
		MetadataHelper.setMetadata(key, value, target);
	}
};
