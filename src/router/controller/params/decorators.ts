import { MetadataHelper } from '../../../metadata/helper.ts';
import { ExecutionContext } from '../../router.ts';
import { validateObject } from '../../../deps.ts';
import { Constructor } from '../../../mod.ts';
import { NotValidBodyException } from '../../../exception/mod.ts';

export type OptionsResolver = {
	// deno-lint-ignore no-explicit-any
	target: Constructor | any;
	propertyKey: string | symbol | undefined;
	parameterIndex: number;
};

export type Resolver = (
	context: ExecutionContext,
	opts?: OptionsResolver,
) => unknown | Promise<unknown>;

export const argumentResolverFunctionsMetadataKey = 'argumentResolverFunctions';
export const createParamDecorator = (
	parameterResolver: Resolver,
	additionalDecoratorAction?: ParameterDecorator,
) =>
() =>
(
	// deno-lint-ignore no-explicit-any
	target: Constructor | any,
	propertyKey: string | symbol | undefined,
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
		(context) =>
			parameterResolver(context, { target, propertyKey, parameterIndex }),
	);

	MetadataHelper.setMetadata(
		argumentResolverFunctionsMetadataKey,
		argumentsResolverMap,
		target.constructor,
		propertyKey,
	);

	if (additionalDecoratorAction) {
		additionalDecoratorAction(target, propertyKey, parameterIndex);
	}
};

export const Req = createParamDecorator((context: ExecutionContext) => {
	return context.req;
});

export const Res = createParamDecorator((context: ExecutionContext) => {
	return context.res;
});

export const WebSocket = createParamDecorator((context: ExecutionContext) => {
	return context.websocket;
});

export const Header = (prop?: string) =>
	createParamDecorator((context: ExecutionContext) => {
		if (!context.req.raw.headers) {
			return null;
		}
		return prop ? context.req.header(prop) : context.req.raw.headers;
	})();

export const BODY_TYPE_KEY = 'body-type';

export const Body = (prop?: string) =>
	createParamDecorator(
		async (context: ExecutionContext, opts?: OptionsResolver) => {
			if (!opts) {
				throw {
					status: 500,
					message: 'Options of Body not taken by Body decorator function',
				};
			}

			let body;
			try {
				body = await context.req.json();
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

			const param = prop ? body[prop] : body;
			// Make the validation of body
			if (paramsTypesDTO.length > 0) {
				const errors = validateObject(param, paramsTypesDTO[parameterIndex]);
				if (errors.length > 0) {
					throw new NotValidBodyException(errors);
				}
			}
			return param;
		},
		(target, propertyKey: string | symbol | undefined, parameterIndex) => {
			if (!prop) {
				const paramsTypesDTO: Constructor[] = MetadataHelper.getMetadata(
					'design:paramtypes',
					target,
					propertyKey,
				);
				MetadataHelper.setMetadata(
					BODY_TYPE_KEY,
					paramsTypesDTO[parameterIndex],
					target,
					propertyKey,
				);
			}
		},
	)();

function formatQueryValue(
	queryValue: string[] | undefined,
	value: 'first' | 'last' | 'array' | undefined,
) {
	if (!queryValue) {
		return undefined;
	}

	switch (value) {
		case 'first':
			return queryValue[0];
		case 'last':
			return queryValue[queryValue.length - 1];
		case 'array':
			return queryValue;
		default:
			return queryValue[0];
	}
}

export const QUERY_TYPE_KEY = 'query-type';

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
	return (createParamDecorator((context: ExecutionContext) => {
		const param = typeof pParamOrOptions === 'string'
			? pParamOrOptions
			: undefined;
		const options = typeof pParamOrOptions === 'string'
			? pOptions
			: pParamOrOptions;

		if (param) {
			return formatQueryValue(
				context.req.queries(param),
				options?.value,
			);
		} else {
			return Object.fromEntries(
				Array.from(Object.keys(context.req.query()))
					.map((key) => [
						key,
						formatQueryValue(
							context.req.queries(key as string),
							options?.value || 'first',
						),
					]),
			);
		}
	}, (target, propertyKey, parameterIndex) => {
		if ((typeof pParamOrOptions !== 'string')) {
			const paramsTypesDTO: Constructor[] = MetadataHelper.getMetadata(
				'design:paramtypes',
				target,
				propertyKey,
			);
			MetadataHelper.setMetadata(
				QUERY_TYPE_KEY,
				paramsTypesDTO[parameterIndex],
				target,
				propertyKey,
			);
		}
	}))();
}

export const Param = (paramName: string) =>
	createParamDecorator((context: ExecutionContext) => {
		const params = context.req.param();
		if (paramName) {
			return params?.[paramName];
		} else {
			return params;
		}
	})();

export const Session = (prop?: string) =>
	createParamDecorator((context: ExecutionContext) => {
		if (prop) {
			return context.get('session').get(prop);
		} else {
			return context.get('session');
		}
	})();
