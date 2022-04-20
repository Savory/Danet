import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts";
import { dependencyInjectionMetadataKey, SCOPE } from '../injectable/decorator.ts';
import { Constructor } from '../utils/constructor.ts';

export class Injector {
  private resolved = new Map<Constructor, () => unknown>();

  public bootstrap<T>(Type: Constructor<T>) {
    const dependencies = this.getDependencies(Type);
    this.resolveDependencies(dependencies);
    return new Type(...dependencies.map((Dep) => this.resolved.get(Dep)!()));
  }

  private resolveDependencies(Types: Constructor[]) {
    Types.forEach((Type) => {
      if (!this.resolved.get(Type)) {
        const dependencies = this.getDependencies(Type);
        this.resolveDependencies(dependencies);
        const injectableMetadata = Reflect.getOwnMetadata(dependencyInjectionMetadataKey, Type);
        if (injectableMetadata?.scope === SCOPE.GLOBAL) {
          const instance = new Type(...dependencies.map((Dep) => this.resolved.get(Dep)!()));
          this.resolved.set(Type, () => instance);
        } else {
          this.resolved.set(Type, () => this.bootstrap(Type));
        }
      }
    })
  }

  private getDependencies(Type: Constructor): Constructor[] {
    return Reflect.getOwnMetadata("design:paramtypes", Type) || [];
  }
}
