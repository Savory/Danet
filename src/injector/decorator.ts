import { MetadataHelper } from '../metadata/helper.ts';
import { DecoratorFunction } from '../mod.ts';

export const injectionTokenMetadataKey = 'injection-token';

export function getInjectionTokenMetadataKey(parameterIndex: number): string {
	return `${injectionTokenMetadataKey}:${parameterIndex}`;
}

/**
 * Decorator to inject using token.
 *
 * Get example here https://danet.land/fundamentals/dynamic-modules.html#module-configuration
 * 
 * @param token - Optional token to identify the dependency.
 * @returns A decorator function that sets the metadata for the injection token.
 */
export function Inject(token?: string): DecoratorFunction {
	return 	(
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
}
};
