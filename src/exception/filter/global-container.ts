import { ExceptionFilter } from './interface.ts';

/**
 * A global container for global exception filters.
 *
 * This array holds instances of middleware that can be applied globally
 * across the application. Each element in the array should conform to the
 * `PossibleMiddlewareType` type.
 *
 * @type {ExceptionFilter[]}
 */
export const globalExceptionFilterContainer: ExceptionFilter[] = [];
