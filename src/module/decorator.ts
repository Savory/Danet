import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { InjectableConstructor } from '../injector/injectable/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { ModuleConstructor } from './constructor.ts';
import { UseClassInjector, UseValueInjector } from '../mod.ts';

/**
 * Metadata for a module.
 *
 * https://danet.land/overview/modules.html
 *
 * @property {Array<ModuleConstructor | DynamicModule>} [imports] - Optional array of modules or dynamic modules to be imported.
 * @property {ControllerConstructor[]} [controllers] - Optional array of controller constructors.
 * @property {Array<InjectableConstructor | UseValueInjector | UseClassInjector>} [injectables] - Optional array of injectables, which can be constructors, value injectors, or class injectors.
 */
export interface ModuleMetadata {
	imports?: Array<ModuleConstructor | DynamicModule>;
	controllers?: ControllerConstructor[];
	injectables?: Array<
		InjectableConstructor | UseValueInjector | UseClassInjector
	>;
}

/**
 * Represents a dynamic module in the application.
 *
 * https://danet.land/fundamentals/dynamic-modules.html
 *
 * @interface DynamicModule
 * @extends {ModuleMetadata}
 *
 * @property {ModuleConstructor} module - The constructor of the module.
 */
export interface DynamicModule extends ModuleMetadata {
	module: ModuleConstructor;
}

export const moduleMetadataKey = 'module';

/**
 * Module Decorator.
 *
 * https://danet.land/overview/modules.html
 *
 * @template T - The type of the class to which the metadata will be attached.
 * @param {ModuleMetadata} options - The metadata options to be attached to the class.
 * @returns {(Type: Constructor<T>) => void} - A function that takes a class constructor and attaches the metadata to it.
 */
export function Module<T>(
	options: ModuleMetadata,
): (Type: Constructor<T>) => void {
	return (Type: Constructor<T>): void => {
		MetadataHelper.setMetadata(moduleMetadataKey, options, Type);
	};
}
