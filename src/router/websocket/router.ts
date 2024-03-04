import { HonoRequest } from 'https://deno.land/x/hono@v4.0.8/request.ts';
import { getPath } from 'https://deno.land/x/hono@v4.0.8/utils/url.ts';
import { RegExpRouter, SmartRouter, TrieRouter } from 'https://deno.land/x/hono@v4.0.8/mod.ts';
import { trimSlash } from '../utils.ts';
import { Constructor } from '../../utils/constructor.ts';
import { hookName } from '../../hook/interfaces.ts';
import { FilterExecutor, GuardExecutor, HttpContext, Injector } from '../../mod.ts';
import { Application } from '../../deps.ts';
import { MetadataHelper } from '../../metadata/helper.ts';
import { ExecutionContext, MiddlewareExecutor } from '../mod.ts';
import { resolveMethodParam } from '../controller/params/resolver.ts';

export class WebSocketRouter {

	private middlewareExecutor: MiddlewareExecutor;
    constructor(
		private injector: Injector,
		private guardExecutor: GuardExecutor = new GuardExecutor(injector),
		private filterExecutor: FilterExecutor = new FilterExecutor(injector),
		private router: Application,
	) {
        this.middlewareExecutor = new MiddlewareExecutor(
			injector,
		);
    }

    public registerController(Controller: Constructor, endpoint: string) {
		endpoint = trimSlash(endpoint);
		const path = (endpoint ? ('/' + endpoint) : '');
		const methods = Object.getOwnPropertyNames(Controller.prototype);
		const smartRouter = new SmartRouter({
			routers: [new RegExpRouter(), new TrieRouter()],
		  });
		for (const methodName of methods) {
			if (
				methodName === 'constructor' ||
				(Object.values(hookName) as string[]).includes(methodName)
			) {
				continue;
			}
			const controllerMethod = Controller.prototype[methodName];
			const topic = MetadataHelper.getMetadata<string>(
				'websocket-topic',
				controllerMethod,
			);
			smartRouter.add('POST', topic, methodName);
		}
		this.router.get(path,
			async (context: HttpContext) => {
				const { response, socket } = Deno.upgradeWebSocket(context.req.raw)
				const _id = crypto.randomUUID();
				(context as ExecutionContext)._id = _id;
				(context as ExecutionContext).getClass = () => Controller;
				context.set('_id', _id);
				(context as ExecutionContext).websocket = socket;
				const executionContext = context as unknown as ExecutionContext;
				const controllerInstance = await this.injector.get(
					Controller,
					executionContext,
					// deno-lint-ignore no-explicit-any
				) as any;
				socket.onopen = async () => {
					try {
						await this.guardExecutor.executeAllRelevantGuards(
							executionContext,
							Controller,
							() => ({}),
						);
					} catch (e) {
						socket.close(1008, 'Unauthorized');
					}
				};
				socket.onmessage = async (event) => {
					
					const { topic, data } = JSON.parse(event.data);					
					const fakeRequest = new Request(`https://fakerequest.com/${topic}`, { method: 'POST', body: JSON.stringify(data) });
					const [methods, foundParam] = smartRouter.match('POST', topic);
					const methodName = methods[0][0] as string;
					const messageExecutionContext = {} as ExecutionContext;

					messageExecutionContext.req = new HonoRequest(fakeRequest, getPath(fakeRequest), [methods, foundParam] as any);
					const _id = crypto.randomUUID();
					messageExecutionContext._id = _id;
					messageExecutionContext.getClass = () => Controller;
					messageExecutionContext.getHandler = () => controllerInstance[methodName];
					messageExecutionContext.websocketTopic = topic;
					messageExecutionContext.websocketMessage = data;
					await this.middlewareExecutor.executeAllRelevantMiddlewares(
						context as unknown as ExecutionContext,
						Controller,
						controllerInstance[methodName],
						async () => {
							try {
								await this.guardExecutor.executeAllRelevantGuards(
									messageExecutionContext,
									(() => ({})) as any,
									controllerInstance[methodName],
								);
							} catch (e) {
								socket.close(1008, 'Unauthorized');
								return;
							}
							const params = await resolveMethodParam(
								Controller,
								controllerInstance[methodName],
								messageExecutionContext,
							);
							let response;
							try {
								response = await controllerInstance[methodName](...params);
							} catch (error) {
								response = await this.filterExecutor
									.executeControllerAndMethodFilter(
										executionContext,
										error,
										Controller,
										controllerInstance[methodName],
									);
							}
							if (response)
								socket.send(JSON.stringify(response));
						});
				};
				return response;
			}
		);
	}
}