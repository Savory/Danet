import { MetadataHelper } from '../../../metadata/helper.ts';
import { HttpContext } from '../../router.ts';
import { validateObject } from '../../../deps.ts';
import { Constructor } from '../../../mod.ts';
import { NotValidBodyException } from '../../../exception/mod.ts';

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
				throw new NotValidBodyException(errors);
			}
		}

		if (prop) {
			return body[prop];
		}

		return body;
	})();

function formatQueryValue(
	queryValue: string[] | undefined,
	value: 'first' | 'last' | 'array' | undefined,
) {
	if (!queryValue || !value) {
		return undefined;
	}

	switch (value || 'last') {
		case 'first':
			return queryValue[0];
		case 'last':
			return queryValue[queryValue.length - 1];
		case 'array':
			return queryValue;
		default:
			return undefined;
	}
}

export interface QueryOption {
	value?: 'first' | 'last' | 'array';
}
export function Query(
	options?: QueryOption,
): ReturnType<ReturnType<typeof createParamDecorator>>;
export function Query(
	param: string,
	options?: QueryOption,
): ReturnType<ReturnType<typeof createParamDecorator>>;
export function Query(
	pParamOrOptions?: string | QueryOption,
	pOptions?: QueryOption,
) {
	return (createParamDecorator((context: HttpContext) => {
		const param = typeof pParamOrOptions === 'string'
			? pParamOrOptions
			: undefined;
		const options = typeof pParamOrOptions === 'string'
			? pOptions
			: pParamOrOptions;

		if (param) {
			return formatQueryValue(
				context.request.url.searchParams.getAll(param),
				options?.value,
			);
		} else {
			return Object.fromEntries(
				Array.from(context.request.url.searchParams.keys())
					.map((key) => [
						key,
						formatQueryValue(
							context.request.url.searchParams.getAll(key),
							options?.value,
						),
					]),
			);
		}
	}))();
}

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
