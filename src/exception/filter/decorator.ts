import { MetadataHelper } from '../../metadata/helper.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Constructor } from '../../utils/constructor.ts';

export const filterExceptionMetadataKey = 'filterException';
export const UseFilter = (guard: Constructor) =>
(
	// deno-lint-ignore ban-types
	target: ControllerConstructor | Object,
	propertyKey?: string | symbol,
	// deno-lint-ignore no-explicit-any
	descriptor?: TypedPropertyDescriptor<any>,
) => {
	if (propertyKey && descriptor) {
		MetadataHelper.setMetadata(
			filterExceptionMetadataKey,
			guard,
			descriptor.value,
		);
	} else {
		MetadataHelper.setMetadata(
			filterExceptionMetadataKey,
			guard,
			target,
		);
	}
};

export const filterCatchTypeMetadataKey = 'errorCaught';
export function Catch<T>(ErrorType: Constructor) {
	return (Type: Constructor<T>): void => {
		MetadataHelper.setMetadata(filterCatchTypeMetadataKey, ErrorType, Type);
	};
}
