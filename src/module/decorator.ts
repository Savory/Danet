import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { InjectableConstructor } from '../injector/injectable/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { ModuleConstructor } from './constructor.ts';
import { UseClassInjector, UseValueInjector } from '../mod.ts';

export interface ModuleMetadata {
	imports?: Array<ModuleConstructor | DynamicModule>;
	controllers?: ControllerConstructor[];
	injectables?: Array<
		InjectableConstructor | UseValueInjector | UseClassInjector
	>;
}

export interface DynamicModule extends ModuleMetadata {
	module: ModuleConstructor;
}

export const moduleMetadataKey = 'module';

export function Module<T>(options: ModuleMetadata) {
	return (Type: Constructor<T>): void => {
		MetadataHelper.setMetadata(moduleMetadataKey, options, Type);
	};
}
