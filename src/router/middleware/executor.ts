import { Injector } from '../../injector/injector.ts';
import { Callback, HttpContext } from '../router.ts';
import { ControllerConstructor } from '../controller/constructor.ts';
import { InjectableConstructor } from '../../injector/injectable/constructor.ts';
import { MetadataHelper } from '../../metadata/helper.ts';
import {
	DanetMiddleware,
	isMiddlewareClass,
	MiddlewareFunction,
	middlewareMetadataKey,
	PossibleMiddlewareType,
} from './decorator.ts';
import { Constructor } from '../../utils/constructor.ts';
import { globalMiddlewareContainer } from './global-container.ts';

export class MiddlewareExecutor {
	constructor(private injector: Injector) {
	}

	async executeAllRelevantMiddlewares(
		context: HttpContext,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	) {
		if (globalMiddlewareContainer.length > 0) {
			await this.executeMiddlewares(context, globalMiddlewareContainer);
		}
		await this.retrieveAndExecuteSymbolMiddleware(context, Controller);
		await this.retrieveAndExecuteSymbolMiddleware(context, ControllerMethod);
	}

	private async retrieveAndExecuteSymbolMiddleware(
		context: HttpContext,
		symbol: unknown,
	) {
		const middlewares: InjectableConstructor[] = MetadataHelper.getMetadata(
			middlewareMetadataKey,
			symbol,
		);
		if (middlewares) {
			await this.executeMiddlewares(context, middlewares);
		}
	}

	private async executeMiddlewares(
		context: HttpContext,
		middlewares: PossibleMiddlewareType[],
	) {
		const injectablesMiddleware: InjectableConstructor[] = middlewares.filter(
			isMiddlewareClass,
		) as InjectableConstructor[];
		await this.injector.registerInjectables(injectablesMiddleware);
		for (const middleware of middlewares) {
			if (isMiddlewareClass(middleware)) {
				const middlewareInstance: DanetMiddleware = await this.injector.get<
					DanetMiddleware
				>(middleware as Constructor<DanetMiddleware>);
				await middlewareInstance.action(context);
			} else {
				await (middleware as MiddlewareFunction)(context);
			}
		}
	}
}
