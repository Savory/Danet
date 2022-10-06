import { getQuery } from '../../../deps.ts';
import { MetadataHelper } from '../../../metadata/helper.ts';
import { HttpContext } from '../../router.ts';
import { validateObject } from '../../../deps.ts';
import { Constructor } from '../../../mod.ts';

export type OptionsResolver = {
	target: Constructor;
	propertyKey: string | symbol;
	parameterIndex: number;
};

export type Resolver = (
	context: HttpContext,
	opts?: OptionsResolver,
) => unknown | Promise<unknown>;

export const argumentResolverFunctionsMetadataKey = 'argumentResolverFunctions';
export const createParamDecorator = (resolver: Resolver) =>
() =>
(
	target: Constructor,
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
		(context) => resolver(context, { target, propertyKey, parameterIndex }),
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
	createParamDecorator(async (context: HttpContext, opts?: OptionsResolver) => {
		if (!opts) {
			throw {
				status: 500,
				message: 'Options of Body not taken by Body decorator function',
			};
		}

		let body;
		try {
			body = await context.request.body({ type: 'json' })?.value;
		} catch (e) {
			throw e;
		}

		if (!body) {
			return null;
		}

		// Extract Class type of Parameter with @Body
		const { parameterIndex } = opts;
		const paramsTypesDTO: Constructor[] = MetadataHelper.getMetadata(
			'design:paramtypes',
			opts.target,
			opts.propertyKey,
		);

		// Make the validation of body
		if (paramsTypesDTO.length > 0) {
			const errors = validateObject(body, paramsTypesDTO[parameterIndex]);
			if (errors.length > 0) {
				throw {
					status: 400,
					message: 'Body bad formatted',
					reasons: errors,
				};
			}
		}

		if (prop) {
			return body[prop];
		}

		return body;
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
