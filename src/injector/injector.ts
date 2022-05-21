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

export class Injector {
	private resolved = new Map<Constructor | string, () => unknown>();
	private availableTypes: InjectableConstructor[] = [];
	private logger: Logger = new Logger('Injector');

	public getAll() {
		return this.resolved;
	}

	public has<T>(Type: Constructor<T> | string): boolean {
		return this.resolved.has(Type);
	}

	public get<T>(Type: Constructor<T> | string): T {
		if (this.resolved.has(Type)) {
			return this.resolved.get(Type)!() as T;
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
			this.registerInjectables(injectables);
		}
		if (controllers) {
			this.resolveControllers(controllers);
		}
		await this.executeOnAppBoostrapHook(controllers, injectables);
	}

	public addAvailableInjectable(injectables: InjectableConstructor[]) {
		this.availableTypes = this.availableTypes.concat(...injectables);
	}

	public registerInjectables(
		Injectables: Array<InjectableConstructor | TokenInjector>,
	) {
		Injectables?.forEach((Provider: InjectableConstructor | TokenInjector) => {
			this.resolveInjectable(Provider);
		});
	}

	public resolveControllers(Controllers: ControllerConstructor[]) {
		Controllers?.forEach((Controller: ControllerConstructor) => {
			this.resolveControllerDependencies(Controller);
		});
	}

	private resolveControllerDependencies<T>(Type: Constructor<T>) {
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
		const resolvedDependencies = dependencies.map((Dep, idx) =>
			this.resolved.get(this.getParamToken(Type, idx) ?? Dep)!()
		);
		if (canBeSingleton) {
			const instance = new Type(...resolvedDependencies);
			this.resolved.set(Type, () => instance);
		} else {
			this.resolved.set(Type, () => new Type(...resolvedDependencies));
		}
	}

	private resolveInjectable(
		Type: InjectableConstructor | TokenInjector,
		ParentConstructor?: Constructor,
	) {
		const actualType = Type instanceof TokenInjector ? Type.useClass : Type;
		const actualKey = Type instanceof TokenInjector ? Type.token : Type;
		const dependencies = this.getDependencies(actualType);
		this.resolveDependencies(dependencies, actualType);
		const injectableMetadata = MetadataHelper.getMetadata<InjectableOption>(
			injectionData,
			Type,
		);
		const resolvedDependencies = dependencies.map((Dep, idx) =>
			this.resolved.get(this.getParamToken(actualType, idx) ?? Dep)!()
		);
		if (injectableMetadata?.scope === SCOPE.GLOBAL) {
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
			this.resolved.set(
				actualKey,
				() => new actualType(...resolvedDependencies),
			);
		}
	}

	private getParamToken(Type: Constructor, paramIndex: number) {
		return MetadataHelper.getMetadata<string>(
			getInjectionTokenMetadataKey(paramIndex),
			Type,
		);
	}

	private resolveDependencies(
		Dependencies: Constructor[],
		ParentConstructor: Constructor,
	) {
		Dependencies.forEach((Dependency) => {
			if (!this.resolved.get(Dependency)) {
				if (this.availableTypes.includes(Dependency)) {
					this.resolveInjectable(Dependency, ParentConstructor);
				} else {
					throw new Error(
						`${Dependency.name} is not available in injection context. Did you provide it in module ?`,
					);
				}
			}
		});
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
					await this.get<any>(controller).onAppBootstrap?.();
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
					await this.get<any>(actualKey).onAppBootstrap?.();
				}
			}
		}
	}
}
