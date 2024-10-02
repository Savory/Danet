import type { MiddlewareHandler as HonoMiddleware } from '../../deps.ts';
import { ExecutionContext } from '../router.ts';
import { InjectableConstructor } from '../../injector/injectable/constructor.ts';
import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';

/**
 * Interface representing a middleware.
 *
 * @interface DanetMiddleware
 *
 * @method action
 * @param {ExecutionContext} ctx - The execution context for the middleware.
 * @param {NextFunction} next - The next function to call in the middleware chain.
 * @returns {Promise<unknown> | unknown} - A promise or a value indicating the result of the middleware action.
 */
export interface DanetMiddleware {
	action(ctx: ExecutionContext, next: NextFunction): Promise<unknown> | unknown;
}

/**
 * Represents a function that, when called, proceeds to the next middleware in the chain.
 *
 * @returns A promise that resolves to either void or a Response object.
 */
export type NextFunction = () => Promise<void | Response>;

export type MiddlewareFunction = (
	ctx: ExecutionContext,
	next: NextFunction,
) => unknown;

export type PossibleMiddlewareType =
	| InjectableConstructor
	| HonoMiddleware
	| MiddlewareFunction;
export const isMiddlewareClass = (s: PossibleMiddlewareType) => !!s.prototype;
export const middlewareMetadataKey = 'middlewares';
/**
 * A decorator function that attaches middleware to a route handler or controller.
 *
 * @param {...PossibleMiddlewareType[]} middlewares - A list of middleware functions to be applied.
 * @returns {MetadataFunction} - A function that sets the metadata for the middleware.
 */
export function Middleware(
	...middlewares: PossibleMiddlewareType[]
): MetadataFunction {
	return SetMetadata(middlewareMetadataKey, middlewares);
}
