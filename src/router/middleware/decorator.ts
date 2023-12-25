import type { MiddlewareHandler as HonoMiddleware } from '../../deps.ts';
import { HttpContext } from '../router.ts';
import { InjectableConstructor } from '../../injector/injectable/constructor.ts';
import { SetMetadata } from '../../metadata/decorator.ts';

export interface DanetMiddleware {
	action(ctx: HttpContext, next: NextFunction): Promise<unknown> | unknown;
}

export type NextFunction = () => Promise<unknown>;

export type MiddlewareFunction = (
	ctx: HttpContext,
	next: NextFunction,
) => unknown;

export type PossibleMiddlewareType =
	| InjectableConstructor
	| HonoMiddleware;
export const isMiddlewareClass = (s: PossibleMiddlewareType) => !!s.prototype;
export const middlewareMetadataKey = 'middlewares';
export const Middleware = (...middlewares: PossibleMiddlewareType[]) =>
	SetMetadata(middlewareMetadataKey, middlewares);
