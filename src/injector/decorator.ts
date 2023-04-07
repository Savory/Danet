import { MetadataHelper } from '../metadata/helper.ts';

export const injectionTokenMetadataKey = 'injection-token';

export function getInjectionTokenMetadataKey(parameterIndex: number) {
	return `${injectionTokenMetadataKey}:${parameterIndex}`;
}

export const Inject = (token?: string) =>
(
	// deno-lint-ignore no-explicit-any
	target: Record<string, unknown> | any,
	propertyKey: string | symbol | undefined,
	parameterIndex: number,
) => {
	MetadataHelper.setMetadata(
		getInjectionTokenMetadataKey(parameterIndex),
		token,
		target,
	);
};
