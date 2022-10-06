import { getQuery } from '../../../deps.ts';
import { MetadataHelper } from '../../../metadata/helper.ts';
import { HttpContext } from '../../router.ts';
import { Reflect } from '../../../deps.ts';
import { validateObject } from 'https://deno.land/x/validatte/mod.ts';

export type Resolver = (
	context: HttpContext,
	opts: any,
) => unknown | Promise<unknown>;

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

	argumentsResolverMap.set(
		parameterIndex,
		(c) => resolver(c, { target, propertyKey, parameterIndex }),
	);

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
	createParamDecorator(async (context: HttpContext, opts: any) => {
		if (!opts) {
			console.log('no options received');
		}

		let body;
		try {
			body = await context.request.body({ type: 'json' })?.value;
		} catch (e) {
			throw e;
		}

		const i = opts.parameterIndex;
		const params = MetadataHelper.getMetadata(
			'design:paramtypes',
			opts.target,
			opts.propertyKey,
		);

		// Make the validation of body
		console.log('Body valid?');
		console.log(validateObject(body, params[i]));

		if (!body) {
			return null;
		}
		return prop ? body[prop] : body;
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
