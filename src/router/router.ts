import { Application, Context, type HandlerInterface } from '../deps.ts';

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
import { NextFunction } from './middleware/decorator.ts';

// deno-lint-ignore no-explicit-any
export type Callback = (...args: any[]) => unknown;

export type HttpContext = Context;

export type ExecutionContext = HttpContext & {
	_id: string;
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
		const controllerMethod = Controller.prototype[handlerName];
		let endpoint = MetadataHelper.getMetadata<string>(
			'endpoint',
			controllerMethod,
		);

		basePath = trimSlash(basePath);
		endpoint = trimSlash(endpoint);
		const path = (basePath ? ('/' + basePath) : '') +
			(endpoint ? '/' + endpoint : '');

		const httpMethod = MetadataHelper.getMetadata<string>(
			'method',
			controllerMethod,
		);
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
		routerFn.call(
			this.router,
			path,
			async (context: HttpContext, next: NextFunction) => {
				const _id = crypto.randomUUID();
				(context as ExecutionContext)._id = _id;
				(context as ExecutionContext).getClass = () => Controller;
				(context as ExecutionContext).getHandler = () => controllerMethod;
				context.res = new Response();
				context.set('_id', _id);
				try {
					await this.middlewareExecutor.executeAllRelevantMiddlewares(
						context as unknown as ExecutionContext,
						Controller,
						controllerMethod,
						next,
					);
				} catch (error) {
					return this.handleError(
						context as ExecutionContext,
						error,
						Controller,
						controllerMethod,
					);
				}
			},
			this.handleRoute(Controller, controllerMethod),
		);
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
			(context as ExecutionContext)._id = context.get('_id');
			(context as ExecutionContext).getClass = () => Controller;
			(context as ExecutionContext).getHandler = () => ControllerMethod;
			if (!context.res) {
				context.res = new Response();
			}
			try {
				const executionContext = context as unknown as ExecutionContext;
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
				return await this.sendResponse(
					response,
					ControllerMethod,
					executionContext,
				);
			} catch (error) {
				return this.handleError(
					context as ExecutionContext,
					error,
					Controller,
					ControllerMethod,
				);
			}
		};
	}

	private async handleError(
		executionContext: ExecutionContext,
		// deno-lint-ignore no-explicit-any
		error: any,
		Controller: ControllerConstructor,
		// deno-lint-ignore no-explicit-any
		ControllerMethod: (...args: any[]) => unknown,
	) {
		const filterResponse = await this.filterExecutor
			.executeControllerAndMethodFilter(
				executionContext,
				error,
				Controller,
				ControllerMethod,
			);
		if (filterResponse) {
			executionContext.res = filterResponse;
			return executionContext.res;
		}
		const status = error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
		const message = error.message || 'Internal server error!';
		this.injector.cleanRequestInjectables(executionContext._id);
		executionContext.res = executionContext.json({
			...error,
			status,
			message,
		}, status);
		return executionContext.res;
	}

	private async sendResponse(
		response: string | Record<string, unknown>,
		ControllerMethod: Callback,
		context: HttpContext,
	) {
		if (response) {
			const fileName = MetadataHelper.getMetadata<string>(
				rendererViewFile,
				ControllerMethod,
			);
			if (fileName) {
				context.res = await context.html(
					await this.viewRenderer.render(
						fileName,
						response,
					),
					{
						headers: context.res.headers,
					},
				);
			} else {
				if (typeof response !== 'string') {
					context.res = await context.json(response, {
						headers: context.res.headers,
					});
				} else {
					context.res = await context.text(response, {
						headers: context.res.headers,
					});
				}
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
