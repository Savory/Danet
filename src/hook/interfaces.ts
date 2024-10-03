/**
 * @module
 * Hook interfaces.
 * Provide lifecycle hooks interface for the application.
 * https://danet.land/fundamentals/lifecycle.html
 */

import { HttpContext } from '../router/router.ts';

/**
 * Interface representing a hook that is called when the application is bootstrapped.
 * https://danet.land/fundamentals/lifecycle.html
 */
export interface OnAppBootstrap {
	onAppBootstrap(): void | Promise<void>;
}

/**
 * Interface representing a handler for application shutdown events.
 */
export interface OnAppClose {
	onAppClose(): void | Promise<void>;
}

/**
 * Interface representing a hook that is called before a controller method is invoked.
 * Useful for Request Scoped Services.
 */
export interface BeforeControllerMethodIsCalled {
	beforeControllerMethodIsCalled(ctx?: HttpContext): void | Promise<void>;
}

/**
 * Enum representing the names of various hooks in the application.
 *
 * @enum {string}
 * @property {string} APP_CLOSE - Hook triggered when the application is closing.
 * @property {string} APP_BOOTSTRAP - Hook triggered when the application is bootstrapping.
 */
export enum hookName {
	APP_CLOSE = 'onAppClose',
	APP_BOOTSTRAP = 'onAppBootstrap',
}
