import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Callback, HttpContext } from '../../router/router.ts';
import { Constructor } from '../../utils/constructor.ts';
import { filterCatchTypeMetadataKey, filterExceptionMetadataKey } from './decorator.ts';
import { ExceptionFilter } from './interface.ts';

export class FilterExecutor {

  private getErrorTypeCaughtByExceptionFilter(exceptionConstructor: Constructor) {
    return Reflect.getMetadata(filterCatchTypeMetadataKey, exceptionConstructor);
  }

  private async executeFilter(exceptionFilter: ExceptionFilter, context: HttpContext, error: unknown): Promise<boolean> {
    if (exceptionFilter) {
      // deno-lint-ignore no-explicit-any
      const errorTypeCaughtByFilter = this.getErrorTypeCaughtByExceptionFilter((exceptionFilter as any).constructor);
      if (errorTypeCaughtByFilter) {
        if (!(error instanceof errorTypeCaughtByFilter))
          return false;
      }
      await exceptionFilter.catch(error, context);
      return true;
    }
    return false;
  }

  // deno-lint-ignore ban-types
  private executeFilterFromMetadata(context: HttpContext, error: unknown, constructor: Constructor | Function): Promise<boolean> {
    const filter: ExceptionFilter = Reflect.getMetadata(filterExceptionMetadataKey, constructor);
    return this.executeFilter(filter, context, error);
  }

  async executeControllerAndMethodFilter(context: HttpContext, error: unknown, Controller: ControllerConstructor, ControllerMethod: Callback): Promise<boolean> {
    return (await this.executeFilterFromMetadata(context, error, Controller) || await this.executeFilterFromMetadata(context, error, ControllerMethod));
  }
}
