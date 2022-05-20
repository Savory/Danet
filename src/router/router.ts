import { State } from 'https://deno.land/x/oak@v9.0.1/application.ts';
import { Context } from 'https://deno.land/x/oak@v9.0.1/context.ts';
import { Router } from 'https://deno.land/x/oak@v9.0.1/router.ts';

import { FilterExecutor } from '../exception/filter/executor.ts';
import { HTTP_STATUS } from '../exception/http/enum.ts';
import { GuardExecutor } from '../guard/executor.ts';
import { hookName } from '../hook/interfaces.ts';
import { Injector } from '../injector/injector.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { Constructor } from '../utils/constructor.ts';
import { ControllerConstructor } from './controller/constructor.ts';
import {
	argumentResolverFunctionsMetadataKey,
	Resolver,
} from './controller/params/decorators.ts';
import { trimSlash } from './utils.ts';

// deno-lint-ignore no-explicit-any
export type Callback = (...args: any[]) => unknown;

export type HttpContext = Context;

export class DanetRouter {
	public router = new Router();
	constructor(
		private injector: Injector,
		private guardExecutor: GuardExecutor = new GuardExecutor(injector),
		private filterExecutor: FilterExecutor = new FilterExecutor(),
	) {
	}
	methodsMap = new Map([
		['DELETE', this.router.delete],
		['GET', this.router.get],
		['PATCH', this.router.patch],
		['POST', this.router.post],
		['PUT', this.router.put],
		['OPTIONS', this.router.options],
		['HEAD', this.router.head],
		['ALL', this.router.all],
	]);
	public createRoute(
		handlerName: string | hookName,
		Controller: Constructor,
		basePath: string,
	) {
		if (
			handlerName === 'constructor' ||
			(Object.values(hookName) as string[]).includes(handlerName)
		) {
			return;
		}
		const handler = Controller.prototype[handlerName];
		let endpoint = MetadataHelper.getMetadata<string>('endpoint', handler);

		basePath = trimSlash(basePath);
		endpoint = trimSlash(endpoint);
		const path = basePath + (endpoint ? '/' + endpoint : '');

		const httpMethod = MetadataHelper.getMetadata<string>('method', handler);
		const routerFn = this.methodsMap.get(httpMethod || 'ALL');
		if (!routerFn) {
			throw new Error(`The method ${httpMethod} can not be handled by.`);
		}

		routerFn.call(this.router, path, this.handleRoute(Controller, handler));
	}

	handleRoute(Controller: ControllerConstructor, ControllerMethod: Callback) {
		return async (context: HttpContext) => {
			try {
				// deno-lint-ignore no-explicit-any
				const controllerInstance = this.injector.get(Controller) as any;
				await this.guardExecutor.executeAllRelevantGuards(
					context,
					Controller,
					ControllerMethod,
				);
				const params = await this.resolveMethodParam(
					Controller,
					ControllerMethod,
					context,
				);
				const response =
					(await controllerInstance[ControllerMethod.name](...params)) as
						| Record<string, unknown>
						| string;
				if (response) {
					context.response.body = response;
				}
			} catch (error) {
				const errorIsCaught = await this.filterExecutor
					.executeControllerAndMethodFilter(
						context,
						error,
						Controller,
						ControllerMethod,
					);
				if (errorIsCaught) {
					return;
				}
				const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
				const message = error.message || 'Internal server error!';

				context.response.body = {
					...error,
					status,
					message,
				};
				context.response.status = status;
			}
		};
	}

	private async resolveMethodParam(
		Controller: ControllerConstructor,
		// deno-lint-ignore no-explicit-any
		ControllerMethod: (...args: any[]) => unknown,
		// deno-lint-ignore no-explicit-any
		context: Context<State, Record<string, any>>,
	) {
		const paramResolverMap: Map<number, Resolver> = MetadataHelper.getMetadata(
			argumentResolverFunctionsMetadataKey,
			Controller,
			ControllerMethod.name,
		);
		const params: unknown[] = [];
		if (paramResolverMap) {
			for (const [key, value] of paramResolverMap) {
				params[key] = await value(context);
			}
		}
		return params;
	}
}
