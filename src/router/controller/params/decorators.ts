import { getQuery } from 'https://deno.land/x/oak@v10.5.1/helpers.ts';
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

export const Header = (prop?: string) =>
	createParamDecorator((context: HttpContext) => {
		if (!context.request.headers) {
			return null;
		}
		return prop ? context.request.headers.get(prop) : context.request.headers;
	})();

export const Body = (prop?: string) =>
	createParamDecorator(async (context: HttpContext) => {
		let body;
		try {
			body = await context.request.body({ type: 'json' })?.value;
		} catch (e) {
			throw e;
		}

		if (!body) {
			return null;
		}
		return prop ? body[prop] : body;
	})();

	export const Query = (param?: string) =>
		createParamDecorator((context: HttpContext) => {
			const query = getQuery(context);
			if (param) {
				return query[param];
			} else {
				return query;
			}
		})();

export const QueryAll = (params?: string) =>
	createParamDecorator((context: HttpContext) => {
		if (params) {
			return context.request.url.searchParams.getAll(params);
		} else {
			return Object.fromEntries(
				Array.from(context.request.url.searchParams.keys())
					.map(key => [key, context.request.url.searchParams.getAll(key)])
			);
		}
	})();

export const Param = (paramName: string) =>
	createParamDecorator((context: HttpContext) => {
		// not sure why params is not exposed, but it definitely is the right way to do this
		// deno-lint-ignore no-explicit-any
		const params = (context as any).params;
		if (paramName) {
			return params?.[paramName];
		} else {
			return params;
		}
	})();
