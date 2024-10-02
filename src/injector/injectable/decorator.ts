import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';

/**
 * The different scopes for dependency injection.
 * 
 * @enum {string}
 * @property {string} GLOBAL - Represents a global scope where the instance is shared across the entire application.
 * @property {string} REQUEST - Represents a request scope where a new instance is created for each request.
 * @property {string} TRANSIENT - Represents a transient scope where a new instance is created every time it is requested.
 */
export enum SCOPE {
	GLOBAL = 'GLOBAL',
	REQUEST = 'REQUEST',
	TRANSIENT = 'TRANSIENT',
}

/**
 * Options for the Injectable decorator.
 * 
 * @interface InjectableOption
 * 
 * @property {SCOPE} scope - The scope in which the injectable should be instantiated.
 */
export interface InjectableOption {
	scope: SCOPE;
}

export const injectionData = 'dependency-injection';

/**
 * Mark class as an injectable.
 * 
 * @template T - The type of the class being decorated.
 * @param {InjectableOption} [options={ scope: SCOPE.GLOBAL }] - The options for the injectable, including the scope.
 * @returns {MetadataFunction} - A function that sets the metadata for the injectable.
 */
export function Injectable<T>(
	options: InjectableOption = { scope: SCOPE.GLOBAL },
): MetadataFunction {
	return SetMetadata(injectionData, options)
}