import { State } from 'https://deno.land/x/oak@v9.0.1/application.ts';
import { Context } from 'https://deno.land/x/oak@v9.0.1/context.ts';
import { Router } from 'https://deno.land/x/oak@v9.0.1/router.ts';
import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { guardMetadataKey } from '../guard/decorator.ts';
import { AuthGuard } from '../guard/interface.ts';
import { Injector } from '../injector/injector.ts';
import { Constructor } from '../utils/constructor.ts';
import { ControllerConstructor } from './controller/constructor.ts';
import { argumentResolverFunctionsMetadataKey, Resolver } from './controller/params/decorators.ts';
import { removeTrailingSlash } from './utils.ts';


// deno-lint-ignore no-explicit-any
type Callback = (...args: any[]) => unknown;

export type HttpContext = Context;

export class DanetRouter {
  public router = new Router();
  constructor(private injector: Injector) {
  }
  methodsMap = new Map([
    ["DELETE", this.router.delete],
    ["GET", this.router.get],
    ["PATCH", this.router.patch],
    ["POST", this.router.post],
    ["PUT", this.router.put],
  ]);
  public createRoute(methodName: string, Controller: Constructor<unknown>, basePath: string) {
    if (methodName === 'constructor') return;
    const method = Controller.prototype[methodName];
    let endpoint = Reflect.getMetadata('endpoint', method) as string;

    basePath = removeTrailingSlash(basePath);
    endpoint = removeTrailingSlash(endpoint);
    const path = basePath + (endpoint ? '/' + endpoint  : '');

    const httpMethod = Reflect.getMetadata('method', method) as string;
    const routerFn = this.methodsMap.get(httpMethod);
    if (!routerFn)
      throw new Error(`The method ${httpMethod} can not be handled by.`);

    routerFn.call(this.router, path, this.handleRoute(Controller, method));
  }

  handleRoute(Controller: ControllerConstructor, ControllerMethod: Callback) {
    return async (context: HttpContext) => {
      try {
        // deno-lint-ignore no-explicit-any
        const controllerInstance = this.injector.get(Controller) as any;
        await this.executeControllerAndMethodAuthGuards(context, Controller, ControllerMethod);
        const params = await this.resolveMethodParam(Controller, ControllerMethod, context);
        const response = (await controllerInstance[ControllerMethod.name](...params)) as Record<string, unknown> | string;
        if (response)
          context.response.body = response;

      } catch (error) {
        const status = error.status || 500;
        const message = error.message || "Internal server error!";

        context.response.body = {
          ...error,
          status,
          message,
        };
        context.response.status = status;
      }
    };
  }

  async executeControllerAndMethodAuthGuards(context: HttpContext, Controller: ControllerConstructor, ControllerMethod: Callback) {
    const controllerGuard: AuthGuard = Reflect.getMetadata(guardMetadataKey, Controller);
    if (controllerGuard)
      await controllerGuard.canActivate(context);
    const methodGuard: AuthGuard = Reflect.getMetadata(guardMetadataKey, ControllerMethod);
    if (methodGuard)
      await methodGuard.canActivate(context);
  }

  // deno-lint-ignore no-explicit-any
  private async resolveMethodParam(Controller: ControllerConstructor, ControllerMethod: (...args: any[]) => unknown, context: Context<State, Record<string, any>>) {
    const paramResolverMap: Map<number, Resolver> = Reflect.getOwnMetadata(argumentResolverFunctionsMetadataKey, Controller, ControllerMethod.name);
    const params: unknown[] = [];
    if (paramResolverMap) {
      for (const [ key, value ] of paramResolverMap) {
        params[key] = await value(context);
      }
    }
    return params;
  }
}
