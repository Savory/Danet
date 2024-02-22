import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { InjectableConstructor } from '../injector/injectable/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { ModuleConstructor } from './constructor.ts';
import { UseClassInjector, UseValueInjector } from '../mod.ts';

export class ModuleOptions {
	imports?: Array<ModuleConstructor | ModuleOptions> = [];
	controllers?: ControllerConstructor[] = [];
	injectables?: Array<
		InjectableConstructor | UseValueInjector | UseClassInjector
	> = [];
}

export class ModuleInstance extends ModuleOptions {}

export const moduleMetadataKey = 'module';

export function Module<T>(options: ModuleOptions) {
	return (Type: Constructor<T>): void => {
		MetadataHelper.setMetadata(moduleMetadataKey, options, Type);
	};
}
