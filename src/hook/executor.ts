import { InjectableHelper } from '../injector/injectable/helper.ts';
import { Injector } from '../injector/injector.ts';

export class HookExecutor {
  constructor(private injector: Injector) {
  }

  public async executeAppCloseHook() {
    const injectables = this.injector.getAll();
    for (const [_, value] of injectables) {
      // deno-lint-ignore no-explicit-any
      const instance: any = value();
      if (InjectableHelper.isGlobal(instance?.constructor)) {
        await instance?.onAppClose?.();
      }
    }
  }

  public async executeAppBootstrapHook() {
    const injectables = this.injector.getAll();
    for (const [_, value] of injectables) {
      // deno-lint-ignore no-explicit-any
      const instance: any = value();
      if (InjectableHelper.isGlobal(instance?.constructor)) {
        await instance?.onAppBootstrap?.();
      }
    }
  }

}
