import type { MiddlewareHandler as HonoMiddleware } from '../../deps.ts';
import { ExecutionContext } from '../router.ts';
import { InjectableConstructor } from '../../injector/injectable/constructor.ts';
import { SetMetadata } from '../../metadata/decorator.ts';

export interface DanetMiddleware {
	action(ctx: ExecutionContext, next: NextFunction): Promise<unknown> | unknown;
}

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
export const Middleware = (...middlewares: PossibleMiddlewareType[]) =>
	SetMetadata(middlewareMetadataKey, middlewares);
