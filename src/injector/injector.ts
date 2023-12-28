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
import { ExecutionContext } from '../router/router.ts';

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

	public getAll() {
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
	}

	public addAvailableInjectable(injectables: InjectableConstructor[]) {
		for (const injectable of injectables) {
			const actualKey = injectable instanceof TokenInjector
				? injectable.token
				: injectable;
			const actualType = injectable instanceof TokenInjector
				? injectable.useClass
				: injectable;
			this.availableTypes.set(actualKey, actualType);
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
		} else {
			this.setNonSingleton(Type, Type, dependencies);
		}
	}

	private async resolveInjectable(
		Type: InjectableConstructor | TokenInjector,
		ParentConstructor?: Constructor,
		token?: string,
	) {
		const actualType = Type instanceof TokenInjector ? Type.useClass : Type;
		const actualKey = Type instanceof TokenInjector
			? Type.token
			: (token ?? Type);
		const dependencies = this.getDependencies(actualType);

		if (this.resolved.has(actualType)) {
			return;
		}

		await this.resolveDependencies(dependencies, actualType);
		const injectableMetadata = MetadataHelper.getMetadata<InjectableOption>(
			injectionData,
			actualType,
		);
		let canBeSingleton = injectableMetadata?.scope !== SCOPE.REQUEST &&
			injectableMetadata?.scope !== SCOPE.TRANSIENT;
		if (canBeSingleton) {
			for (const [idx, Dep] of dependencies.entries()) {
				const token = this.getParamToken(actualType, idx);
				const type = this.resolvedTypes.get(token ?? Dep);
				const dependencyInjectableMetadata = MetadataHelper.getMetadata<
					InjectableOption
				>(
					injectionData,
					type,
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
			this.resolvedTypes.set(actualKey, actualType);
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
				dependencies,
				injectableMetadata?.scope === SCOPE.TRANSIENT,
			);
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

	private getDependencies(Type: Constructor): Constructor[] {
		return MetadataHelper.getMetadata('design:paramtypes', Type) || [];
	}

	cleanRequestInjectables(_id: string) {
		this.contextInjectables.delete(_id);
	}
}
