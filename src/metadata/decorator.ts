import { ControllerConstructor } from '../router/controller/constructor.ts';
import { MetadataHelper } from './helper.ts';

export type MetadataFunction =  (
	// deno-lint-ignore ban-types
	target: ControllerConstructor | Object,
	propertyKey?: string | symbol,
	// deno-lint-ignore no-explicit-any
	descriptor?: TypedPropertyDescriptor<any>,
) => void;

export const SetMetadata = (key: string, value: unknown): MetadataFunction =>
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
