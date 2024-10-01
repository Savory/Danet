import { Logger } from '../logger.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { getInjectionTokenMetadataKey } from './decorator.ts';
import {
	InjectableConstructor,
	UseClassInjector,
	UseValueInjector,
} from './injectable/constructor.ts';
import {
	InjectableOption,
	injectionData,
	SCOPE,
} from './injectable/decorator.ts';
import { ExecutionContext } from '../router/router.ts';
import { ModuleMetadata } from '../mod.ts';

export class Injector {
	private resolved = new Map<
		Constructor | string,
		(ctx?: ExecutionContext) => Promise<unknown> | unknown
	>();
	private availableTypes = new Map<Constructor | string, Constructor>();
	private logger: Logger = new Logger('Injector');
	private resolvedTypes = new Map<
		Constructor | string,
		Constructor
	>();
	private contextInjectables = new Map<
		string,
		Map<Constructor | string, unknown>
	>();
	// deno-lint-ignore no-explicit-any
	public modules: Array<any> = [];
	// deno-lint-ignore no-explicit-any
	public controllers: Array<any> = [];
	// deno-lint-ignore no-explicit-any
	public injectables: Array<any> = [];

	public getAll(): typeof this.resolved {
		return this.resolved;
	}

	public has<T>(Type: Constructor<T> | string): boolean {
		return this.resolved.has(Type);
	}

	public get<T>(Type: Constructor<T> | string, ctx?: ExecutionContext): T {
		if (this.resolved.has(Type)) {
			return this.resolved.get(Type)!(ctx) as T;
		}
		throw Error(`Type ${Type} not injected`);
	}

	public async bootstrapModule(module: ModuleMetadata) {
		this.logger.log(`Bootstraping ${module.constructor.name}`);
		const { controllers, injectables } = module;
		if (injectables) {
			this.addAvailableInjectable(injectables);
			await this.registerInjectables(injectables);
		}
		if (controllers) {
			await this.resolveControllers(controllers);
		}
		this.resolved.set(module.constructor as Constructor, () => module);
		this.modules.push(module);
	}

	public addAvailableInjectable(
		injectables:
			(InjectableConstructor | UseClassInjector | UseValueInjector)[],
	) {
		for (const injectable of injectables) {
			const { actualKey, actualType, instance } = this.getKeyAndTypeOrInstance(
				injectable,
			);
			this.availableTypes.set(actualKey, actualType ?? instance);
		}
	}

	public async registerInjectables(
		Injectables: Array<
			InjectableConstructor | UseClassInjector | UseValueInjector
		>,
	) {
		for (const Provider of Injectables) {
			await this.resolveInjectable(Provider);
		}
	}

	public async resolveControllers(Controllers: ControllerConstructor[]) {
		for (const Controller of Controllers) {
			await this.resolveControllerParameters(Controller);
		}
	}

	private async resolveControllerParameters<T>(Type: Constructor<T>) {
		let canBeSingleton = true;
		const dependencies = this.getParametersTypes(Type);
		dependencies.forEach((DependencyType, idx) => {
			const actualType = this.getParamToken(Type, idx) ?? DependencyType;
			if (!this.resolved.has(actualType)) {
				throw new Error(
					`${Type.name} dependency ${
						this.getParamToken(Type, idx) ?? DependencyType.name
					} is not available in injection context. Did you provide it in module ?`,
				);
			}
			const injectableMetadata = MetadataHelper.getMetadata<InjectableOption>(
				injectionData,
				this.resolvedTypes.get(actualType),
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
			this.resolvedTypes.set(Type, Type);
			this.controllers.push(instance);
		} else {
			this.setNonSingleton(Type, Type, dependencies);
		}
	}

	private async resolveInjectable(
		Type: InjectableConstructor | UseClassInjector | UseValueInjector,
		ParentConstructor?: Constructor,
		token?: string,
	) {
		const { actualType, actualKey, instance } = this.getKeyAndTypeOrInstance(
			Type,
			token,
		);
		if (!actualType) {
			this.resolved.set(actualKey, () => instance);
			this.resolvedTypes.set(actualKey, instance);
			this.injectables.push(instance);
			return;
		}
		const parameters = this.getParametersTypes(actualType);

		if (this.resolved.has(actualType ?? instance)) {
			return;
		}

		if (parameters.length > 0) {
			await this.resolveDependencies(parameters, actualType);
		}
		const injectableMetadata = MetadataHelper.getMetadata<InjectableOption>(
			injectionData,
			actualType,
		);

		let canBeSingleton = injectableMetadata?.scope !== SCOPE.REQUEST &&
			injectableMetadata?.scope !== SCOPE.TRANSIENT;
		if (canBeSingleton) {
			for (const [idx, Dep] of parameters.entries()) {
				const token = this.getParamToken(actualType, idx);
				const typeOrValue = this.resolvedTypes.get(token ?? Dep);
				if (!MetadataHelper.IsObject(typeOrValue)) {
					continue;
				}
				const dependencyInjectableMetadata = MetadataHelper.getMetadata<
					InjectableOption
				>(
					injectionData,
					typeOrValue,
				);
				if (
					dependencyInjectableMetadata?.scope === SCOPE.REQUEST ||
					dependencyInjectableMetadata?.scope === SCOPE.TRANSIENT
				) {
					canBeSingleton = false;
				}
			}
		}
		if (canBeSingleton) {
			const resolvedParameters = new Array<Constructor>();
			for (const [idx, Dep] of parameters.entries()) {
				resolvedParameters.push(
					await (this.resolved.get(
						this.getParamToken(actualType, idx) ?? Dep,
					)!()) as Constructor,
				);
			}
			const instance = new actualType(...resolvedParameters);
			this.resolved.set(actualKey, () => instance);
			this.resolvedTypes.set(actualKey, actualType);
			this.injectables.push(instance);
		} else {
			if (
				injectableMetadata?.scope !== SCOPE.TRANSIENT &&
				injectableMetadata?.scope !== SCOPE.REQUEST
			) {
				MetadataHelper.setMetadata(
					injectionData,
					{ scope: SCOPE.REQUEST },
					actualType,
				);
			}
			if (ParentConstructor) {
				MetadataHelper.setMetadata(
					injectionData,
					{ scope: SCOPE.REQUEST },
					ParentConstructor,
				);
			}
			this.setNonSingleton(
				actualType,
				actualKey,
				parameters,
				injectableMetadata?.scope === SCOPE.TRANSIENT,
			);
		}
	}

	private getKeyAndTypeOrInstance(
		Type: InjectableConstructor | UseValueInjector | UseClassInjector,
		token?: string | undefined,
	) {
		if (Object.hasOwn(Type, 'token')) {
			const actualKey = (Type as UseClassInjector).token;
			if (Object.hasOwn(Type, 'useClass')) {
				return { actualKey, actualType: (Type as UseClassInjector).useClass };
			} else if (Object.hasOwn(Type, 'useValue')) {
				return {
					actualKey,
					instance: (Type as UseValueInjector).useValue ?? null,
				};
			}
		}
		return {
			actualKey: (token ?? Type as InjectableConstructor),
			actualType: Type as InjectableConstructor,
		};
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
		transient?: boolean,
	) {
		this.resolvedTypes.set(key, Type);
		this.resolved.set(key, async (ctx?: ExecutionContext) => {
			const resolvedDependencies = new Array<Constructor>();
			for (const [idx, Dep] of dependencies.entries()) {
				resolvedDependencies.push(
					await (this.resolved.get(this.getParamToken(Type, idx) ?? Dep)!(
						ctx,
					)) as Constructor,
				);
			}
			if (ctx && !transient) {
				if (!this.contextInjectables.has(ctx._id)) {
					this.contextInjectables.set(ctx._id, new Map());
				}
				const actualRequestInjectables = this.contextInjectables.get(ctx._id);
				if (actualRequestInjectables?.has(key)) {
					return actualRequestInjectables.get(key);
				}
			}
			// deno-lint-ignore no-explicit-any
			const instance: any = new Type(...resolvedDependencies) as any;
			if (instance.beforeControllerMethodIsCalled && ctx) {
				await instance.beforeControllerMethodIsCalled(ctx);
			}
			if (ctx && !transient) {
				this.contextInjectables.get(ctx._id)!.set(key, instance);
			}
			return instance;
		});
	}

	private async resolveDependencies(
		Dependencies: Constructor[],
		ParentConstructor: Constructor,
	) {
		for (const [idx, Dependency] of Dependencies.entries()) {
			const token = this.getParamToken(ParentConstructor, idx);
			if (
				!this.resolved.get(token ?? Dependency)
			) {
				const type = this.availableTypes.get(token ?? Dependency);
				if (type) {
					await this.resolveInjectable(type, ParentConstructor, token);
				} else {
					throw new Error(
						`${Dependency.name} is not available in injection context. Did you provide it in module ?`,
					);
				}
			}
		}
	}

	private getParametersTypes(Type: Constructor): Constructor[] {
		return MetadataHelper.getMetadata('design:paramtypes', Type) || [];
	}

	cleanRequestInjectables(_id: string) {
		this.contextInjectables.delete(_id);
	}
}
export let injector: Injector;

// @ts-ignore used before initialization
if (!injector) {
	injector = new Injector();
}
