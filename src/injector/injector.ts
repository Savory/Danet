import { Logger } from '../logger.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ModuleConstructor } from '../module/constructor.ts';
import { moduleMetadataKey } from '../module/decorator.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { getInjectionTokenMetadataKey } from './decorator.ts';
import {
	InjectableConstructor,
	TokenInjector,
} from './injectable/constructor.ts';
import {
	InjectableOption,
	injectionData,
	SCOPE,
} from './injectable/decorator.ts';
import { InjectableHelper } from './injectable/helper.ts';
import { HttpContext } from '../router/router.ts';
import { BeforeControllerMethodIsCalled } from '../hook/interfaces.ts';

export class Injector {
	private resolved = new Map<
		Constructor | string,
		(ctx?: HttpContext) => Promise<unknown> | unknown
	>();
	private availableTypes = new Map<InjectableConstructor, boolean>();
	private logger: Logger = new Logger('Injector');

	public getAll() {
		return this.resolved;
	}

	public has<T>(Type: Constructor<T> | string): boolean {
		return this.resolved.has(Type);
	}

	public get<T>(Type: Constructor<T> | string, ctx?: HttpContext): Promise<T> {
		if (this.resolved.has(Type)) {
			return this.resolved.get(Type)!(ctx) as Promise<T>;
		}
		throw Error(`Type ${Type} not injected`);
	}

	public async bootstrap(ModuleType: ModuleConstructor) {
		this.logger.log(`Bootstraping ${ModuleType.name}`);
		// deno-lint-ignore no-explicit-any
		const { controllers, injectables } = MetadataHelper.getMetadata<any>(
			moduleMetadataKey,
			ModuleType,
		);
		if (injectables) {
			this.addAvailableInjectable(injectables);
			await this.registerInjectables(injectables);
		}
		if (controllers) {
			await this.resolveControllers(controllers);
		}
		await this.executeOnAppBoostrapHook(controllers, injectables);
	}

	public addAvailableInjectable(injectables: InjectableConstructor[]) {
		for (const injectable of injectables) {
			this.availableTypes.set(injectable, true);
		}
	}

	public async registerInjectables(
		Injectables: Array<InjectableConstructor | TokenInjector>,
	) {
		for (const Provider of Injectables) {
			await this.resolveInjectable(Provider);
		}
	}

	public async resolveControllers(Controllers: ControllerConstructor[]) {
		for (const Controller of Controllers) {
			await this.resolveControllerDependencies(Controller);
		}
	}

	private async resolveControllerDependencies<T>(Type: Constructor<T>) {
		let canBeSingleton = true;
		const dependencies = this.getDependencies(Type);
		dependencies.forEach((DependencyType, idx) => {
			if (!this.resolved.has(this.getParamToken(Type, idx) ?? DependencyType)) {
				throw new Error(
					`${Type.name} dependency ${
						this.getParamToken(Type, idx) ?? DependencyType.name
					} is not available in injection context. Did you provide it in module ?`,
				);
			}
			const injectableMetadata = MetadataHelper.getMetadata<InjectableOption>(
				injectionData,
				DependencyType,
			);
			if (injectableMetadata?.scope === SCOPE.REQUEST) {
				canBeSingleton = false;
			}
		});
		if (canBeSingleton) {
			const resolvedDependencies = new Array<Constructor>();
			for (const [idx, Dep] of dependencies.entries()) {
				resolvedDependencies.push(
					await (this.resolved.get(
						this.getParamToken(Type, idx) ?? Dep,
					)!()) as Constructor,
				);
			}
			const instance = new Type(...resolvedDependencies);
			this.resolved.set(Type, () => instance);
		} else {
			this.setNonSingleton(Type, Type, dependencies);
		}
	}

	private async resolveInjectable(
		Type: InjectableConstructor | TokenInjector,
		ParentConstructor?: Constructor,
	) {
		const actualType = Type instanceof TokenInjector ? Type.useClass : Type;
		const actualKey = Type instanceof TokenInjector ? Type.token : Type;
		const dependencies = this.getDependencies(actualType);

		const injectableMetadata = MetadataHelper.getMetadata<InjectableOption>(
			injectionData,
			Type,
		);
		await this.resolveDependencies(dependencies, actualType);
		if (injectableMetadata?.scope === SCOPE.GLOBAL) {
			const resolvedDependencies = new Array<Constructor>();
			for (const [idx, Dep] of dependencies.entries()) {
				resolvedDependencies.push(
					await (this.resolved.get(
						this.getParamToken(actualType, idx) ?? Dep,
					)!()) as Constructor,
				);
			}
			const instance = new actualType(...resolvedDependencies);
			this.resolved.set(actualKey, () => instance);
		} else {
			if (ParentConstructor) {
				MetadataHelper.setMetadata(
					injectionData,
					{ scope: SCOPE.REQUEST },
					ParentConstructor,
				);
			}
			this.setNonSingleton(actualType, actualKey, dependencies);
		}
	}

	private getParamToken(Type: Constructor, paramIndex: number) {
		return MetadataHelper.getMetadata<string>(
			getInjectionTokenMetadataKey(paramIndex),
			Type,
		);
	}

	private setNonSingleton(
		Type: Constructor,
		key: string | InjectableConstructor,
		dependencies: Array<Constructor>,
	) {
		this.resolved.set(key, async (ctx?: HttpContext) => {
			const resolvedDependencies = new Array<Constructor>();
			for (const [idx, Dep] of dependencies.entries()) {
				resolvedDependencies.push(
					await (this.resolved.get(this.getParamToken(Type, idx) ?? Dep)!(
						ctx,
					)) as Constructor,
				);
			}
			// deno-lint-ignore no-explicit-any
			const instance: any = new Type(...resolvedDependencies) as any;
			if (instance.beforeControllerMethodIsCalled && ctx) {
				await instance.beforeControllerMethodIsCalled(ctx);
			}
			return instance;
		});
	}

	private async resolveDependencies(
		Dependencies: Constructor[],
		ParentConstructor: Constructor,
	) {
		for (const [idx, Dependency] of Dependencies.entries()) {
			if (
				!this.resolved.get(
					this.getParamToken(ParentConstructor, idx) ?? Dependency,
				)
			) {
				if (this.availableTypes.get(Dependency)) {
					await this.resolveInjectable(Dependency, ParentConstructor);
				} else {
					throw new Error(
						`${Dependency.name} is not available in injection context. Did you provide it in module ?`,
					);
				}
			}
		}
	}

	private getDependencies(Type: Constructor): Constructor[] {
		return MetadataHelper.getMetadata('design:paramtypes', Type) || [];
	}

	private async executeOnAppBoostrapHook(
		Controllers?: ControllerConstructor[],
		injectables?: Array<InjectableConstructor | TokenInjector>,
	) {
		if (Controllers) {
			for (const controller of Controllers) {
				if (InjectableHelper.isGlobal(controller)) {
					// deno-lint-ignore no-explicit-any
					await (await this.get<any>(controller)).onAppBootstrap?.();
				}
			}
		}
		if (injectables) {
			for (const injectable of injectables) {
				const actualType = injectable instanceof TokenInjector
					? injectable.useClass
					: injectable;
				const actualKey = injectable instanceof TokenInjector
					? injectable.token
					: injectable;
				if (InjectableHelper.isGlobal(actualType)) {
					// deno-lint-ignore no-explicit-any
					await (await this.get<any>(actualKey)).onAppBootstrap?.();
				}
			}
		}
	}
}
