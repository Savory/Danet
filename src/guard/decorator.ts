import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { Constructor } from '../utils/constructor.ts';

export const guardMetadataKey = 'authGuards';
export const UseGuard = (guard: Constructor) =>
(
	// deno-lint-ignore ban-types
	target: ControllerConstructor | Object,
	propertyKey?: string | symbol,
	// deno-lint-ignore no-explicit-any
	descriptor?: TypedPropertyDescriptor<any>,
) => {
	const guardInstance = new guard();
	if (propertyKey && descriptor) {
		MetadataHelper.setMetadata(
			guardMetadataKey,
			guardInstance,
			descriptor.value,
		);
	} else {
		MetadataHelper.setMetadata(guardMetadataKey, guardInstance, target);
	}
};
