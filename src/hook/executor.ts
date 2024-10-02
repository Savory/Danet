/**
 * @module
 * Hook executor.
 * Provides a class to execute hooks for every injectable.
 */


import { InjectableHelper } from '../injector/injectable/helper.ts';
import { Injector } from '../injector/injector.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { hookName } from './interfaces.ts';

/**
 * The `HookExecutor` class is responsible for executing hooks on all injectables
 * retrieved from the provided `Injector`. It ensures that hooks are executed
 * only on instances that are objects and are marked as global.
 */
export class HookExecutor {
	/**
	 * Creates an instance of `HookExecutor`.
	 * @param injector - The injector instance used to retrieve all injectables.
	 */
	constructor(private injector: Injector) {}

	/**
	 * Executes a specified hook on every injectable retrieved from the injector.
	 * It iterates through all injectables, checks if they are objects, and then
	 * executes the hook on each instance.
	 * 
	 * @param hookName - The name of the hook to be executed.
	 */
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

	/**
	 * Executes a specified hook on a given instance if the instance is marked as global.
	 * 
	 * @param instance - The instance on which the hook is to be executed.
	 * @param hookName - The name of the hook to be executed.
	 */
	
	// deno-lint-ignore no-explicit-any
	private async executeInstanceHook(instance: any, hookName: hookName) {
		if (InjectableHelper.isGlobal(instance?.constructor)) {
			await instance?.[hookName]?.();
		}
	}
}
