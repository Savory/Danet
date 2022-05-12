import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Callback, HttpContext } from '../../router/router.ts';
import { Constructor } from '../../utils/constructor.ts';
import { filterExceptionMetadataKey } from './decorator.ts';
import { ExceptionFilter } from './interface.ts';

export class FilterExecutor {

  async executeFilter(exceptionFilter: ExceptionFilter, context: HttpContext, error: unknown): Promise<boolean> {
    if (exceptionFilter) {
      await exceptionFilter.catch(error, context);
      return true;
    }
    return false;
  }


  // deno-lint-ignore ban-types
  executeFilterFromMetadata(context: HttpContext, error: unknown, constructor: Constructor | Function): Promise<boolean> {
    const filter: ExceptionFilter = Reflect.getMetadata(filterExceptionMetadataKey, constructor);
    return this.executeFilter(filter, context, error);
  }

  async executeControllerAndMethodFilter(context: HttpContext, error: unknown, Controller: ControllerConstructor, ControllerMethod: Callback): Promise<boolean> {
    return (await this.executeFilterFromMetadata(context, error, Controller) || await this.executeFilterFromMetadata(context, error, ControllerMethod));
  }
}
