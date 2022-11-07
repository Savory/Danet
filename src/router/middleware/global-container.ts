import { DanetMiddleware } from './decorator.ts';
import { Constructor } from '../../utils/constructor.ts';

export const globalMiddlewareContainer: Constructor<DanetMiddleware>[] = [];
