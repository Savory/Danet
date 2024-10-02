/**   
** metadataDecorator
** Provides decorator to set Metadata
** @module
*/

import { ControllerConstructor } from '../router/controller/constructor.ts';
import { MetadataHelper } from './helper.ts';

/**
 * A function type that represents a metadata decorator.
 *
 * @param target - The target object or constructor to which the metadata is applied.
 * @param propertyKey - An optional property key for the target.
 * @param descriptor - An optional property descriptor for the target.
 */
export type MetadataFunction =  (
	// deno-lint-ignore ban-types
	target: ControllerConstructor | Object,
	propertyKey?: string | symbol,
	// deno-lint-ignore no-explicit-any
	descriptor?: TypedPropertyDescriptor<any>,
) => void;

/**
 * Sets metadata on the target object or method.
 *
 * @param key - The key for the metadata.
 * @param value - The value for the metadata.
 * @returns a MetadaFunction.
 */
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
