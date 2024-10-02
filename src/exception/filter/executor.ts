import { MetadataHelper } from '../../metadata/helper.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Callback, HttpContext } from '../../router/router.ts';
import { Constructor } from '../../utils/constructor.ts';
import {
	filterCatchTypeMetadataKey,
	filterExceptionMetadataKey,
} from './decorator.ts';
import { ExceptionFilter } from './interface.ts';
import { Injector } from '../../injector/injector.ts';
import { WebSocketPayload } from '../../router/websocket/payload.ts';

/**
 * @class FilterExecutor
 * @description
 * The `FilterExecutor` class is responsible for executing exception filters
 * based on metadata and handling errors within the context of an HTTP request.
 * It utilizes an injector to manage dependencies and retrieve filter instances.
 *
 * @constructor
 * @param {Injector} injector - The dependency injector used to manage and retrieve filter instances.
 */
export class FilterExecutor {
	constructor(private injector: Injector) {
	}

	private getErrorTypeCaughtByExceptionFilter(
		exceptionConstructor: Constructor,
	) {
		// deno-lint-ignore ban-types
		return MetadataHelper.getMetadata<Function>(
			filterCatchTypeMetadataKey,
			exceptionConstructor,
		);
	}

	private executeFilter(
		exceptionFilter: ExceptionFilter,
		context: HttpContext,
		error: unknown,
	): Response | undefined | { topic: string; data: unknown } {
		if (exceptionFilter) {
			const errorTypeCaughtByFilter = this.getErrorTypeCaughtByExceptionFilter(
				// deno-lint-ignore no-explicit-any
				(exceptionFilter as any).constructor,
			);
			if (errorTypeCaughtByFilter) {
				if (!(error instanceof errorTypeCaughtByFilter)) {
					return;
				}
			}
			return exceptionFilter.catch(error, context);
		}
		return;
	}

	private async executeFilterFromMetadata(
		context: HttpContext,
		error: unknown,
		// deno-lint-ignore ban-types
		constructor: Constructor | Function,
	): Promise<Response | undefined | WebSocketPayload> {
		const FilterConstructor: Constructor<ExceptionFilter> = MetadataHelper
			.getMetadata<Constructor<ExceptionFilter>>(
				filterExceptionMetadataKey,
				constructor,
			);
		if (FilterConstructor) {
			await this.injector.registerInjectables([FilterConstructor]);
			const filter: ExceptionFilter = this.injector.get<ExceptionFilter>(
				FilterConstructor,
			);
			return this.executeFilter(filter, context, error);
		}
		return;
	}

	/**
	 * Executes filters for both the controller and the controller method.
	 *
	 * @param context - The HTTP context for the current request.
	 * @param error - The error that occurred.
	 * @param Controller - The constructor of the controller.
	 * @param ControllerMethod - The method of the controller to be executed.
	 * @returns A promise that resolves to a `Response`, `undefined`, or `WebSocketPayload`.
	 */
	async executeControllerAndMethodFilter(
		context: HttpContext,
		error: unknown,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	): Promise<Response | undefined | WebSocketPayload> {
		return (await this.executeFilterFromMetadata(context, error, Controller) ||
			await this.executeFilterFromMetadata(context, error, ControllerMethod));
	}
}
