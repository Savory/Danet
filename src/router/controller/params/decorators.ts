import { MetadataHelper } from '../../../metadata/helper.ts';
import { ExecutionContext } from '../../router.ts';
import { validateObject } from '../../../deps.ts';
import { Constructor } from '../../../mod.ts';
import { NotValidBodyException } from '../../../exception/mod.ts';

/**
 * A type representing a decorator function.
 *
 * @param target - The target constructor or any other type.
 * @param propertyKey - The property key of the method or undefined.
 * @param parameterIndex - The index of the parameter in the method's parameter list.
 */
export type DecoratorFunction = (
	// deno-lint-ignore no-explicit-any
	target: Constructor | any,
	propertyKey: string | symbol | undefined,
	parameterIndex: number,
) => void;

export type OptionsResolver = {
	// deno-lint-ignore no-explicit-any
	target: Constructor | any;
	propertyKey: string | symbol | undefined;
	parameterIndex: number;
};

/**
 * A type alias for a function that resolves a value based on the provided execution context and optional resolver options.
 *
 * @param context - The execution context in which the resolver is invoked.
 * @param opts - Information about which class/property the decorator was attached to.
 * @returns The resolved value, which can be either a synchronous value or a promise that resolves to a value.
 */
export type Resolver = (
	context: ExecutionContext,
	opts?: OptionsResolver,
) => unknown | Promise<unknown>;

export const argumentResolverFunctionsMetadataKey = 'argumentResolverFunctions';
/**
 * Creates a parameter decorator that resolves a parameter using the provided resolver function.
 * Optionally, an additional decorator action can be executed.
 *
 * @param parameterResolver - A function that resolves the parameter value.
 * @param additionalDecoratorAction - An optional additional decorator action to be executed.
 * @returns A decorator function that can be used to decorate a parameter.
 */
export function createParamDecorator(
	parameterResolver: Resolver,
	additionalDecoratorAction?: ParameterDecorator,
): () => DecoratorFunction {
	return () =>
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
}

/* Get current request */
export const Req: DecoratorFunction = createParamDecorator((context: ExecutionContext) => {
	return context.req;
});

/* Get current response */
export const Res: DecoratorFunction = createParamDecorator((context: ExecutionContext) => {
	return context.res;
});


/* Get current request websocket instance */
export const WebSocket: DecoratorFunction = createParamDecorator((context: ExecutionContext) => {
	return context.websocket;
});

/* Get all headers or a specific header */
export const Header: ((prop?: string) => DecoratorFunction)  = (prop?: string) =>
	createParamDecorator((context: ExecutionContext) => {
		if (!context.req.raw.headers) {
			return null;
		}
		return prop ? context.req.header(prop) : context.req.raw.headers;
	})();

export const BODY_TYPE_KEY = 'body-type';

/* Get request's body or a given property */
export const Body: ((prop?: string) => DecoratorFunction) = (prop?: string) =>
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
/* Get all query params or a given query param */
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

/* Get an url param for example /user/:userId */
export function Param(paramName: string): DecoratorFunction {
	return createParamDecorator((context: ExecutionContext) => {
		const params = context.req.param();
		if (paramName) {
			return params?.[paramName];
		} else {
			return params;
		}
	})();
}

/* Get Session or a given property of session */
export function Session(prop?: string): DecoratorFunction {
	return createParamDecorator((context: ExecutionContext) => {
		if (prop) {
			return context.get('session').get(prop);
		} else {
			return context.get('session');
		}
	})()
};
