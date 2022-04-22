import { Context } from 'https://deno.land/x/oak@v9.0.1/context.ts';
import { Router } from 'https://deno.land/x/oak@v9.0.1/router.ts';
import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { Constructor } from '../utils/constructor.ts';
import { ControllerConstructor } from './controller/constructor.ts';
import { argumentResolverFunctionsMetadataKey, Resolver } from './controller/params/decorators.ts';
import { removeTrailingSlash } from './utils.ts';


// deno-lint-ignore no-explicit-any
type Callback = (...args: any[]) => unknown;

export type HttpContext = Context;

export class DanetRouter {
  public router = new Router()
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
    let endpoint = Reflect.getMetadata(
      'endpoint',
      method
    ) as string;
    const httpMethod = Reflect.getMetadata(
      'method',
      method
    ) as string;

    basePath = removeTrailingSlash(basePath);
    endpoint = removeTrailingSlash(endpoint);
    let path = basePath + '/' + endpoint;
    path = removeTrailingSlash(path);

    const routerFn = this.methodsMap.get(httpMethod);
    if (!routerFn)
      throw new Error(`The method ${httpMethod} can not be handled by.`);

    routerFn.call(this.router, path, this.handleRoute(Controller, method));
  }

  handleRoute(Controller: ControllerConstructor, ControllerMethod: Callback) {
    return async (context: HttpContext) => {
      try {
        const paramResolverMap: Map<number, Resolver> = Reflect.getOwnMetadata(argumentResolverFunctionsMetadataKey, Controller.prototype, ControllerMethod.name);
        const params: unknown[] = [];
        for (const [key, value] of paramResolverMap) {
          params[key] = await value(context);
        }
        const response = (await ControllerMethod(...params)) as Record<string, unknown> | string;
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
}
