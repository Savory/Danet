import { PossibleMiddlewareType } from './decorator.ts';

/**
 * A global container for middleware functions.
 *
 * This array holds instances of middleware that can be applied globally
 * across the application. Each element in the array should conform to the
 * `PossibleMiddlewareType` type.
 *
 * @type {PossibleMiddlewareType[]}
 */
export const globalMiddlewareContainer: PossibleMiddlewareType[] = [];
