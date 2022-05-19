import { MetadataHelper } from '../../metadata/helper.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Callback, HttpContext } from '../../router/router.ts';
import { Constructor } from '../../utils/constructor.ts';
import {
	filterCatchTypeMetadataKey,
	filterExceptionMetadataKey,
} from './decorator.ts';
import { ExceptionFilter } from './interface.ts';

export class FilterExecutor {
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
	): Promise<boolean> {
		if (exceptionFilter) {
			const errorTypeCaughtByFilter = this.getErrorTypeCaughtByExceptionFilter(
				// deno-lint-ignore no-explicit-any
				(exceptionFilter as any).constructor,
			);
			if (errorTypeCaughtByFilter) {
				if (!(error instanceof errorTypeCaughtByFilter)) {
					return false;
				}
			}
			await exceptionFilter.catch(error, context);
			return true;
		}
		return false;
	}

	private executeFilterFromMetadata(
		context: HttpContext,
		error: unknown,
		// deno-lint-ignore ban-types
		constructor: Constructor | Function,
	): Promise<boolean> {
		const filter: ExceptionFilter = MetadataHelper.getMetadata<ExceptionFilter>(
			filterExceptionMetadataKey,
			constructor,
		);
		return this.executeFilter(filter, context, error);
	}

	async executeControllerAndMethodFilter(
		context: HttpContext,
		error: unknown,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	): Promise<boolean> {
		return (await this.executeFilterFromMetadata(context, error, Controller) ||
			await this.executeFilterFromMetadata(context, error, ControllerMethod));
	}
}
