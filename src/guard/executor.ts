import { ForbiddenException } from '../exception/http/mod.ts';
import { Injector } from '../injector/injector.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { ExecutionContext, Callback, HttpContext } from '../router/router.ts';
import { Constructor } from '../utils/constructor.ts';
import { GLOBAL_GUARD } from './constants.ts';
import { guardMetadataKey } from './decorator.ts';
import { AuthGuard } from './interface.ts';

export class GuardExecutor {
	constructor(private injector: Injector) {
	}

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

	async executeGlobalGuard(context: ExecutionContext) {
		if (this.injector.has(GLOBAL_GUARD)) {
			const globalGuard: AuthGuard = await this.injector.get(GLOBAL_GUARD);
			await this.executeGuard(globalGuard, context);
		}
	}

	async executeControllerAndMethodAuthGuards(
		context: ExecutionContext,
		Controller: ControllerConstructor,
		ControllerMethod: Callback,
	) {
		await this.executeGuardFromMetadata(context, Controller);
		await this.executeGuardFromMetadata(context, ControllerMethod);
	}

	async executeGuard(guard: AuthGuard, context: ExecutionContext) {
		if (guard) {
			const canActivate = await guard.canActivate(context);
			if (!canActivate) {
				throw new ForbiddenException();
			}
		}
	}

	async executeGuardFromMetadata(
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
