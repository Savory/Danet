import { Injector } from '../../injector/injector.ts';
import { Callback, HttpContext } from '../router.ts';
import { ControllerConstructor } from '../controller/constructor.ts';
import { InjectableConstructor } from '../../injector/injectable/constructor.ts';
import { MetadataHelper } from '../../metadata/helper.ts';
import { DanetMiddleware, middlewareMetadataKey } from './decorator.ts';
import { Constructor } from '../../utils/constructor.ts';

export class MiddlewareExecutor {
  constructor(private injector: Injector) {
  }

  async executeAllRelevantMiddlewares(
    context: HttpContext,
    Controller: ControllerConstructor,
    ControllerMethod: Callback,
  ) {
    await this.executeSymbolMiddlewares(context, Controller);
    await this.executeSymbolMiddlewares(context, ControllerMethod);
  }

  private async executeSymbolMiddlewares(context: HttpContext, symbol: unknown) {
    const middlewares: InjectableConstructor[] = MetadataHelper.getMetadata(middlewareMetadataKey, symbol);
    if (middlewares) {
      await this.injector.registerInjectables(middlewares);
      for (const middlewareConstructor of middlewares) {
        const middlewareInstance: DanetMiddleware = await this.injector.get<DanetMiddleware>(middlewareConstructor as Constructor<DanetMiddleware>);
        await middlewareInstance.action(context);
      }
    }
  }
}
