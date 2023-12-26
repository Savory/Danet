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

	private async executeFilter(
		exceptionFilter: ExceptionFilter,
		context: HttpContext,
		error: unknown,
	): Promise<Response | undefined> {
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
	): Promise<Response | undefined> {
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

	async executeControllerAndMethodFilter(
		context: HttpContext,
		error: unknown,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	): Promise<Response | undefined> {
		return (await this.executeFilterFromMetadata(context, error, Controller) ||
			await this.executeFilterFromMetadata(context, error, ControllerMethod));
	}
}
