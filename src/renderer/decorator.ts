import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';

export const rendererViewFile = 'rendererViewFile';
export const Render = (fileName: string) =>
	(
		// deno-lint-ignore ban-types
		target: ControllerConstructor | Object,
		propertyKey?: string | symbol,
		// deno-lint-ignore no-explicit-any
		descriptor?: TypedPropertyDescriptor<any>,
	) => {
		if (propertyKey && descriptor) {
			MetadataHelper.setMetadata(
				rendererViewFile,
				fileName,
				descriptor.value,
			);
		}
	};
