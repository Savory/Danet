import { InjectableHelper } from '../injector/injectable/helper.ts';
import { Injector } from '../injector/injector.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { hookName } from './interfaces.ts';

export class HookExecutor {
	constructor(private injector: Injector) {
	}

	public async executeHookForEveryInjectable(hookName: hookName) {
		const injectables = this.injector.getAll();
		for (const [_, value] of injectables) {
			const instanceOrValue: unknown = value();
			if (!MetadataHelper.IsObject(instanceOrValue)) {
				continue;
			}
			await this.executeInstanceHook(instanceOrValue, hookName);
		}
	}

	// deno-lint-ignore no-explicit-any
	private async executeInstanceHook(instance: any, hookName: hookName) {
		if (InjectableHelper.isGlobal(instance?.constructor)) {
			await instance?.[hookName]?.();
		}
	}
}
