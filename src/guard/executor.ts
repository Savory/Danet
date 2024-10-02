import { ForbiddenException } from '../exception/http/mod.ts';
import { Injector } from '../injector/injector.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { Callback, ExecutionContext, HttpContext } from '../router/router.ts';
import { Constructor } from '../utils/constructor.ts';
import { GLOBAL_GUARD } from './constants.ts';
import { guardMetadataKey } from './decorator.ts';
import { AuthGuard } from './interface.ts';

/**
 * Responsible for executing various guards in a given execution context.
 * It handles the execution of global guards, controller-level guards, and method-level guards.
 * https://danet.land/overview/guards.html
 * @constructor
 * @param {Injector} injector - The injector instance used to retrieve and manage dependencies.
 */
export class GuardExecutor {
	constructor(private injector: Injector) {
	}

	/**
	 * https://danet.land/overview/guards.html
	 * Executes all relevant guards for the given context, controller, and controller method.
	 *
	 * This method first executes the global guard, followed by the controller and method-specific
	 * authentication guards.
	 *
	 * @param context - The execution context which provides details about the current request.
	 * @param Controller - The constructor of the controller being executed.
	 * @param ControllerMethod - The method of the controller being executed.
	 * @returns A promise that resolves when all relevant guards have been executed.
	 */
	async executeAllRelevantGuards(
		context: ExecutionContext,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	) {
		await this.executeGlobalGuard(context);
		await this.executeControllerAndMethodAuthGuards(
			context,
			Controller,
			ControllerMethod,
		);
	}

	private async executeGlobalGuard(context: ExecutionContext) {
		if (this.injector.has(GLOBAL_GUARD)) {
			const globalGuard: AuthGuard = await this.injector.get(GLOBAL_GUARD);
			await this.executeGuard(globalGuard, context);
		}
	}

	private async executeControllerAndMethodAuthGuards(
		context: ExecutionContext,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	) {
		await this.executeGuardFromMetadata(context, Controller);
		await this.executeGuardFromMetadata(context, ControllerMethod);
	}

	private async executeGuard(guard: AuthGuard, context: ExecutionContext) {
		if (guard) {
			const canActivate = await guard.canActivate(context);
			if (!canActivate) {
				throw new ForbiddenException();
			}
		}
	}

	private async executeGuardFromMetadata(
		context: ExecutionContext,
		// deno-lint-ignore ban-types
		constructor: Constructor | Function,
	) {
		const GuardConstructor: Constructor<AuthGuard> = MetadataHelper.getMetadata<
			Constructor<AuthGuard>
		>(
			guardMetadataKey,
			constructor,
		);
		if (GuardConstructor) {
			await this.injector.registerInjectables([GuardConstructor]);
			const guardInstance: AuthGuard = this.injector.get<AuthGuard>(
				GuardConstructor,
			);
			await this.executeGuard(guardInstance, context);
		}
	}
}
