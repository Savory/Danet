import { Context, Application } from '../deps.ts';

import { FilterExecutor } from '../exception/filter/executor.ts';
import { HTTP_STATUS } from '../exception/http/enum.ts';
import { GuardExecutor } from '../guard/executor.ts';
import { hookName } from '../hook/interfaces.ts';
import { Injector } from '../injector/injector.ts';
import { Logger } from '../logger.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { rendererViewFile } from '../renderer/decorator.ts';
import { HandlebarRenderer } from '../renderer/handlebar.ts';
import { Renderer } from '../renderer/interface.ts';
import { Constructor } from '../utils/constructor.ts';
import { ControllerConstructor } from './controller/constructor.ts';
import {
	argumentResolverFunctionsMetadataKey,
	Resolver,
} from './controller/params/decorators.ts';
import { trimSlash } from './utils.ts';
import { MiddlewareExecutor } from './middleware/executor.ts';
import { HandlerInterface } from 'https://deno.land/x/hono@v3.11.10/types.ts';

// deno-lint-ignore no-explicit-any
export type Callback = (...args: any[]) => unknown;

export type HttpContext = Context;

export type ExecutionContext = HttpContext & {
	_id: string,
	// deno-lint-ignore ban-types
	getHandler: () => Function;
	getClass: () => Constructor;
};

export class DanetRouter {
	private logger: Logger = new Logger('Router');
	private methodsMap: Map<string, HandlerInterface>;
	public prefix?: string;
	private middlewareExecutor: MiddlewareExecutor;
	constructor(
		private injector: Injector,
		private guardExecutor: GuardExecutor = new GuardExecutor(injector),
		private filterExecutor: FilterExecutor = new FilterExecutor(injector),
		private viewRenderer: Renderer = new HandlebarRenderer(),
		private router: Application,
	) {
		this.methodsMap = new Map([
			['DELETE', this.router.delete],
			['GET', this.router.get],
			['PATCH', this.router.patch],
			['POST', this.router.post],
			['PUT', this.router.put],
			['OPTIONS', this.router.options],
			['HEAD', this.router.head],
			['ALL', this.router.all],
		]);
		this.middlewareExecutor = new MiddlewareExecutor(
			injector,
		);
	}
	
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
		const path = (basePath ? ('/' + basePath) : '') +
			(endpoint ? '/' + endpoint : '');

		const httpMethod = MetadataHelper.getMetadata<string>('method', handler);
		const routerFn = this.methodsMap.get(httpMethod || 'ALL');
		if (!routerFn) {
			throw new Error(
				`The method "${httpMethod}" can not be handled by "${basePath}" of controller "${Controller}".`,
			);
		}
		this.logger.log(
			`Registering [${httpMethod}] ${this.prefix ? this.prefix : ''}${
				path ? path : '/'
			}`,
		);
		routerFn.call(this.router, path, this.handleRoute(Controller, handler));
	}

	setPrefix(prefix: string) {
		prefix = prefix.replace(/\/$/, '');
		this.router.basePath(prefix);
		this.prefix = prefix;
	}

	registerControllers(Controllers: Constructor[]) {
		Controllers.forEach((controller) => this.registerController(controller));
	}

	private registerController(Controller: Constructor) {
		const basePath = MetadataHelper.getMetadata<string>('endpoint', Controller);
		const methods = Object.getOwnPropertyNames(Controller.prototype);
		this.logger.log(
			`Registering ${Controller.name} ${basePath ? basePath : '/'}`,
		);
		methods.forEach((methodName) => {
			this.createRoute(methodName, Controller, basePath);
		});
	}

	public handleRoute(
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	) {
		return async (context: HttpContext) => {
			const executionContext = {
				_id: crypto.randomUUID(),
				...context,
				getClass: () => Controller,
				getHandler: () => ControllerMethod,
			} as unknown as ExecutionContext;
			try {				
				return await this.middlewareExecutor.executeAllRelevantMiddlewares(
					context as ExecutionContext,
					Controller,
					ControllerMethod,
					async () => {
						await this.guardExecutor.executeAllRelevantGuards(
							executionContext,
							Controller,
							ControllerMethod,
						);
						const params = await this.resolveMethodParam(
							Controller,
							ControllerMethod,
							executionContext,
						);
						const controllerInstance = await this.injector.get(
							Controller,
							executionContext,
							// deno-lint-ignore no-explicit-any
						) as any;
						const response:
							| Record<string, unknown>
							| string = await controllerInstance[ControllerMethod.name](
								...params,
							);
							this.logger.log(`Controller ${JSON.stringify(response)}`)
							const whatToSend = await this.sendResponse(response, ControllerMethod, executionContext);
							this.logger.log(`What to ${JSON.stringify(whatToSend)}`)
						return whatToSend;
					},
				);
			} catch (error) {
				this.logger.error(JSON.stringify(error));
				const filterResponse = await this.filterExecutor
					.executeControllerAndMethodFilter(
						executionContext,
						error,
						Controller,
						ControllerMethod,
					);
				if (filterResponse) {
					return filterResponse;
				}
				const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
				const message = error.message || 'Internal server error!';
				this.injector.cleanRequestInjectables(executionContext._id);
				executionContext.status(status);
				return executionContext.json({
					...error,
					status,
					message,
				});
			}
		};
	}

	private async sendResponse(
		response: string | Record<string, unknown>,
		ControllerMethod: Callback,
		context: HttpContext,
	) {
		if (response) {
			context.status(200);	
			const fileName = MetadataHelper.getMetadata<string>(
				rendererViewFile,
				ControllerMethod,
			);
			if (fileName) {
				return context.html(await this.viewRenderer.render(
					fileName,
					response,
				));
			} else {
				if (typeof response !== 'string')
					return context.json(response);
				return context.text(response);
			}
		}
		return context.res;
	}

	private async resolveMethodParam(
		Controller: ControllerConstructor,
		// deno-lint-ignore no-explicit-any
		ControllerMethod: (...args: any[]) => unknown,
		context: HttpContext,
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
