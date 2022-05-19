import { getQuery } from 'https://deno.land/x/oak@v9.0.1/helpers.ts';
import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts';
import { MetadataHelper } from '../../../metadata/helper.ts';
import { HttpContext } from '../../router.ts';

export type Resolver = (context: HttpContext) => unknown | Promise<unknown>;

export const argumentResolverFunctionsMetadataKey = 'argumentResolverFunctions';
export const createParamDecorator = (resolver: Resolver) =>
	() =>
		(
			target: Record<string, unknown>,
			propertyKey: string | symbol,
			parameterIndex: number,
		) => {
			const argumentsResolverMap: Map<number, Resolver> =
				MetadataHelper.getMetadata(
					argumentResolverFunctionsMetadataKey,
					target.constructor,
					propertyKey,
				) || new Map<number, Resolver>();
			argumentsResolverMap.set(parameterIndex, resolver);
			MetadataHelper.setMetadata(
				argumentResolverFunctionsMetadataKey,
				argumentsResolverMap,
				target.constructor,
				propertyKey,
			);
		};

export const Req = createParamDecorator((context: HttpContext) => {
	return context.request;
});

export const Res = createParamDecorator((context: HttpContext) => {
	return context.response;
});

export const Body = (prop?: string) =>
	createParamDecorator((context: HttpContext) => {
		if (prop) {
			// deno-lint-ignore no-explicit-any
			return (context.request.body as any)[prop];
		} else {
			return context.request.body;
		}
	})();

export const Query = (prop?: string) =>
	createParamDecorator((context: HttpContext) => {
		const query = getQuery(context, { mergeParams: true });
		if (prop) {
			return query?.[prop];
		} else {
			return query;
		}
	})();

export const Param = (paramName: string) => Query(paramName);
