import { HttpContext } from '../router/router.ts';

export interface OnAppBootstrap {
	onAppBootstrap(): void | Promise<void>;
}

export interface OnAppClose {
	onAppClose(): void | Promise<void>;
}

export interface BeforeControllerMethodIsCalled {
	beforeControllerMethodIsCalled(ctx?: HttpContext): void | Promise<void>;
}

export enum hookName {
	APP_CLOSE = 'onAppClose',
	APP_BOOTSTRAP = 'onAppBootstrap',
}
