import { trimSlash } from '../utils.ts';
import { Constructor } from '../../utils/constructor.ts';
import { hookName } from '../../hook/interfaces.ts';
import {
	FilterExecutor,
	GuardExecutor,
	HttpContext,
	Injector,
} from '../../mod.ts';
import {
	Application,
	getPath,
	HonoRequest,
	RegExpRouter,
	SmartRouter,
	TrieRouter,
} from '../../deps.ts';
import { MetadataHelper } from '../../metadata/helper.ts';
import {
	ControllerConstructor,
	ExecutionContext,
	MiddlewareExecutor,
} from '../mod.ts';
import { resolveMethodParam } from '../controller/params/resolver.ts';

export class WebSocketRouter {
	constructor(
		private injector: Injector,
		private guardExecutor: GuardExecutor = new GuardExecutor(injector),
		private filterExecutor: FilterExecutor = new FilterExecutor(injector),
		private router: Application,
		private middlewareExecutor = new MiddlewareExecutor(injector),
	) {}

	public registerController(Controller: Constructor, endpoint: string) {
		endpoint = trimSlash(endpoint);
		const path = endpoint ? ('/' + endpoint) : '';
		const methods = Object.getOwnPropertyNames(Controller.prototype);
		const topicRouter = new SmartRouter({
			routers: [new RegExpRouter(), new TrieRouter()],
		});
		this.registerTopic(methods, Controller, topicRouter);
		this.router.get(
			path,
			this.handleConnectionRequest(topicRouter, Controller),
		);
	}

	private handleConnectionRequest(
		topicRouter: SmartRouter<unknown>,
		Controller: Constructor,
	) {
		return async (context: HttpContext) => {
			const { response, socket } = Deno.upgradeWebSocket(context.req.raw);
			const _id = crypto.randomUUID();
			(context as ExecutionContext)._id = _id;
			(context as ExecutionContext).getClass = () => Controller;
			(context as ExecutionContext).websocket = socket;
			const executionContext = context as unknown as ExecutionContext;
			const controllerInstance = await this.injector.get(
				Controller,
				executionContext,
				// deno-lint-ignore no-explicit-any
			) as any;
			socket.onopen = this.onConnection(executionContext, Controller, socket);
			socket.onmessage = this.onMessage(
				topicRouter,
				Controller,
				controllerInstance,
				socket,
			);
			return response;
		};
	}

	private onConnection(
		executionContext: ExecutionContext,
		Controller: Constructor,
		socket: WebSocket,
	) {
		return async () => {
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
	}

	private onMessage(
		topicRouter: SmartRouter<unknown>,
		Controller: Constructor,
		// deno-lint-ignore no-explicit-any
		controllerInstance: any,
		socket: WebSocket,
	) {
		return async (event: MessageEvent) => {
			const { topic, data } = JSON.parse(event.data);
			const fakeRequest = new Request(`https://fakerequest.com/${topic}`, {
				method: 'POST',
				body: JSON.stringify(data),
			});
			const [methods, foundParam] = topicRouter.match('POST', topic);
			const methodName = methods[0][0] as string;
			const messageExecutionContext = {} as ExecutionContext;

			messageExecutionContext.req = new HonoRequest(
				fakeRequest,
				getPath(fakeRequest),
				// deno-lint-ignore no-explicit-any
				[methods, foundParam] as any,
				// deno-lint-ignore no-explicit-any
			) as any;
			const _id = crypto.randomUUID();
			messageExecutionContext._id = _id;
			messageExecutionContext.getClass = () => Controller;
			messageExecutionContext.getHandler = () => controllerInstance[methodName];
			messageExecutionContext.websocketTopic = topic;
			messageExecutionContext.websocketMessage = data;
			messageExecutionContext.websocket = socket;
			await this.middlewareExecutor.executeAllRelevantMiddlewares(
				messageExecutionContext as unknown as ExecutionContext,
				Controller,
				controllerInstance[methodName],
				async () => {
					try {
						await this.guardExecutor.executeAllRelevantGuards(
							messageExecutionContext,
							// deno-lint-ignore no-explicit-any
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
								messageExecutionContext,
								error,
								Controller,
								controllerInstance[methodName],
							);
					}
					if (response) {
						socket.send(JSON.stringify(response));
					}
				},
			);
		};
	}

	private registerTopic(
		methods: string[],
		Controller: Constructor,
		topicRouter: SmartRouter<unknown>,
	) {
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
			topicRouter.add('POST', topic, methodName);
		}
	}
}
