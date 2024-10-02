import { Constructor } from '../../utils/constructor.ts';

export type InjectableConstructor = Constructor;

/** @deprecated Prefer plain object of Type UseClassInjector */
export class TokenInjector {
	constructor(public useClass: InjectableConstructor, public token: string) {
	}

}
/**
 * Represents an injector configuration that uses a class constructor for dependency injection.
 * 
 * @typedef {Object} UseClassInjector
 * @property {InjectableConstructor} useClass - The class constructor to be used for injection.
 * @property {string} token - The token that identifies the dependency.
 */
export type UseClassInjector = {
	useClass: InjectableConstructor;
	token: string;
};
/**
 * Represents an injector that uses a specific value for dependency injection.
 * 
 * @typedef {Object} UseValueInjector
 * @property {any} useValue - The value to be used for injection.
 * @property {string} token - The token that identifies the value.
 */
export type UseValueInjector = {
	// deno-lint-ignore no-explicit-any
	useValue: any;
	token: string;
};
