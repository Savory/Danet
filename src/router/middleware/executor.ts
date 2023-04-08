import { Injector } from '../../injector/injector.ts';
import { Callback, ExecutionContext, HttpContext } from '../router.ts';
import { ControllerConstructor } from '../controller/constructor.ts';
import { InjectableConstructor } from '../../injector/injectable/constructor.ts';
import { MetadataHelper } from '../../metadata/helper.ts';
import {
	DanetMiddleware,
	isMiddlewareClass,
	MiddlewareFunction,
	middlewareMetadataKey,
	NextFunction,
	PossibleMiddlewareType,
} from './decorator.ts';
import { Constructor } from '../../utils/constructor.ts';
import { globalMiddlewareContainer } from './global-container.ts';

export class MiddlewareExecutor {
	constructor(private injector: Injector) {
	}

	async executeAllRelevantMiddlewares(
		context: ExecutionContext,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
		next: NextFunction,
	) {
		const middlewares = [...globalMiddlewareContainer];
		middlewares.push(...this.getSymbolMiddlewares(Controller));
		middlewares.push(...this.getSymbolMiddlewares(ControllerMethod));

		if (middlewares.length === 0) return next();
		const injectablesMiddleware: InjectableConstructor[] = middlewares.filter(
			isMiddlewareClass,
		) as InjectableConstructor[];
		let index = -1;
		await this.injector.registerInjectables(injectablesMiddleware);
		const dispatch = async (i: number) => {
			if (i <= index) {
				throw new Error('next() called multiple times.');
			}
			index = i;
			let fn;
			if (i === middlewares.length) {
				fn = next;
				await fn();
				return;
			}
			const currentMiddleware = middlewares[i];
			if (isMiddlewareClass(currentMiddleware)) {
				const middlewareInstance: DanetMiddleware = this.injector.get<
					DanetMiddleware
				>(currentMiddleware as Constructor<DanetMiddleware>);
				fn = async (ctx: HttpContext, nextFn: NextFunction) => {
					await middlewareInstance.action(ctx, nextFn);
				};
			} else {
				fn = async (ctx: HttpContext, nextFn: NextFunction) => {
					await (currentMiddleware as MiddlewareFunction)(ctx, nextFn);
				};
			}
			if (!fn) {
				return;
			}
			await fn(context, dispatch.bind(null, i + 1));
		};

		await dispatch(0);
	}

	private getSymbolMiddlewares(
		symbol: unknown,
	) {
		const middlewares: InjectableConstructor[] = MetadataHelper.getMetadata(
			middlewareMetadataKey,
			symbol,
		);
		if (middlewares) {
			return middlewares;
		}
		return [];
	}
}
