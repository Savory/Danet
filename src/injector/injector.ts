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

/**
 * The `Injector` class is responsible for managing the dependency injection
 * within the application. It maintains a registry of resolved instances,
 * available types, and context-specific injectables. It also handles the
 * bootstrapping of modules, resolving of controllers and injectables, and
 * managing the lifecycle of dependencies.
 *
 * @class
 * @property {Map<Constructor | string, (ctx?: ExecutionContext) => Promise<unknown> | unknown>} resolved - A map of resolved instances.
 * @property {Map<Constructor | string, Constructor>} availableTypes - A map of available types for injection.
 * @property {Logger} logger - Logger instance for logging purposes.
 * @property {Map<Constructor | string, Constructor>} resolvedTypes - A map of resolved types.
 * @property {Map<string, Map<Constructor | string, unknown>>} contextInjectables - A map of context-specific injectables.
 * @property {Array<any>} modules - An array of registered modules.
 * @property {Array<any>} controllers - An array of registered controllers.
 * @property {Array<any>} injectables - An array of registered injectables.
 */
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

	/**
	 * Retrieves all resolved dependencies.
	 *
	 * @returns An object containing all resolved dependencies.
	 */
	public getAll(): typeof this.resolved {
		return this.resolved;
	}

	/**
	 * Checks if a given type or identifier is present in the resolved dependencies.
	 *
	 * @template T - The type of the dependency to check.
	 * @param {Constructor<T> | string} Type - The constructor of the type or a string identifier to check.
	 * @returns {boolean} - Returns `true` if the type or identifier is present, otherwise `false`.
	 */
	public has<T>(Type: Constructor<T> | string): boolean {
		return this.resolved.has(Type);
	}

	/**
	 * Retrieves an instance of the specified type from the injector.
	 *
	 * @template T - The type of the instance to retrieve.
	 * @param {Constructor<T> | string} Type - The constructor function or string identifier of the type to retrieve.
	 * @param {ExecutionContext} [ctx] - Optional execution context to pass to the instance.
	 * @returns {T} The instance of the specified type.
	 * @throws {Error} If the type has not been injected.
	 */
	public get<T>(Type: Constructor<T> | string, ctx?: ExecutionContext): T {
		if (this.resolved.has(Type)) {
			return this.resolved.get(Type)!(ctx) as T;
		}
		throw Error(`Type ${Type} not injected`);
	}

	/**
	 * Bootstraps the given module by registering its injectables and resolving its controllers.
	 *
	 * @param module - The module metadata to bootstrap, containing controllers and injectables.
	 * @returns A promise that resolves when the module has been fully bootstrapped.
	 */
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

	private addAvailableInjectable(
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

	/**
	 * Registers an array of injectables by resolving each one.
	 *
	 * @param Injectables - An array of injectable constructors or injector instances.
	 * @returns A promise that resolves when all injectables have been registered.
	 */
	public async registerInjectables(
		Injectables: Array<
			InjectableConstructor | UseClassInjector | UseValueInjector
		>,
	) {
		for (const Provider of Injectables) {
			await this.resolveInjectable(Provider);
		}
	}

	private async resolveControllers(Controllers: ControllerConstructor[]) {
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
					} is not available in injection context. Did you provide it in module ? If so, make sure you are not doing "import type" (which means it won't exist at runtime)`,
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
						`Failed to resolve param ${idx} of ${ParentConstructor.name}. ${Dependency.name} is not available in injection context. Did you provide it in module ? If so, make sure you are not doing "import type" (which means it won't exist at runtime)`,
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
