import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts";
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { InjectableConstructor, TokenInjector } from '../injectable/constructor.ts';
import { dependencyInjectionMetadataKey, SCOPE } from '../injectable/decorator.ts';
import { ModuleConstructor } from '../module/constructor.ts';
import { moduleMetadataKey } from '../module/decorator.ts';
import { Constructor } from '../utils/constructor.ts';

export class Injector {
  private resolved = new Map<Constructor | string, () => unknown>();
  private availableTypes: InjectableConstructor[] = [];
  public get<T>(Type: Constructor<T> | string): T {
    if (this.resolved.has(Type))
      return this.resolved.get(Type)!() as T;
    throw Error(`Type ${Type} not injected`);
  }

  public bootstrap(ModuleType: ModuleConstructor) {
      const { controllers, injectables } = Reflect.getMetadata(moduleMetadataKey, ModuleType);
      this.addAvailableInjectable(injectables);
      this.registerInjectables(injectables);
      this.resolveControllers(controllers);
  }

  public addAvailableInjectable(injectables: InjectableConstructor[]) {
    this.availableTypes = this.availableTypes.concat(...injectables);
  }

  public registerInjectables(Injectables: Array<InjectableConstructor | TokenInjector>) {
    Injectables?.forEach((Provider: InjectableConstructor | TokenInjector) => {
      this.resolveInjectable(Provider, null);
    });
  }

  public resolveControllers(Controllers: ControllerConstructor[]) {
    Controllers?.forEach((Controller: ControllerConstructor) => {
      this.resolveControllerDependencies(Controller)
    })
  }

  private resolveControllerDependencies<T>(Type: Constructor<T>) {
    let canBeSingleton = true;
    const dependencies = this.getDependencies(Type);
    dependencies.forEach((DependencyType) => {
      if (!this.resolved.has(DependencyType))
        throw new Error(`${Type.name} dependency ${DependencyType.name} is not available in injection context. Did you provide it in module ?`);
      const injectableMetadata = Reflect.getOwnMetadata(dependencyInjectionMetadataKey, DependencyType);
      if (injectableMetadata?.scope === SCOPE.REQUEST) {
        canBeSingleton = false;
      }
    });
    if (canBeSingleton) {
      const instance = new Type(...dependencies.map((Dep) => this.resolved.get(Dep)!()));
      this.resolved.set(Type, () => instance)
    } else {
      this.resolved.set(Type, () => new Type(...dependencies.map((Dep) => this.resolved.get(Dep)!())));
    }
  }

  private resolveInjectable(Type: InjectableConstructor | TokenInjector, ParentConstructor: Constructor | null) {
    const resolvedType = Type instanceof TokenInjector ? Type.useClass : Type;
    const resolvedKey = Type instanceof TokenInjector ? Type.token : Type
    const dependencies = this.getDependencies(resolvedType);
    this.resolveDependencies(dependencies, resolvedType);
    const injectableMetadata = Reflect.getOwnMetadata(dependencyInjectionMetadataKey, Type);
    if (injectableMetadata?.scope === SCOPE.GLOBAL) {
      const instance = new resolvedType(...dependencies.map((Dep) => this.resolved.get(Dep)!()));
      this.resolved.set(resolvedKey, () => instance);
    } else {
      if (ParentConstructor)
        Reflect.defineMetadata(dependencyInjectionMetadataKey, { scope: SCOPE.REQUEST }, ParentConstructor);
      this.resolved.set(resolvedKey, () => new resolvedType(...dependencies.map((Dep) => this.resolved.get(Dep)!())));
    }
  }

  private resolveDependencies(Dependencies: Constructor[], ParentConstructor: Constructor) {
    Dependencies.forEach((Dependency) => {
      if (!this.resolved.get(Dependency)) {
        if (this.availableTypes.includes(Dependency)) {
          this.resolveInjectable(Dependency, ParentConstructor);
        } else {
          throw new Error(`${Dependency.name} is not available in injection context. Did you provide it in module ?`);
        }
      }
    })
  }

  private getDependencies(Type: Constructor): Constructor[] {
    return Reflect.getOwnMetadata("design:paramtypes", Type) || [];
  }
}
