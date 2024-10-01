import { MetadataHelper } from '../metadata/helper.ts';
import { DecoratorFunction } from '../mod.ts';

export const injectionTokenMetadataKey = 'injection-token';

export function getInjectionTokenMetadataKey(parameterIndex: number): string {
	return `${injectionTokenMetadataKey}:${parameterIndex}`;
}

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
