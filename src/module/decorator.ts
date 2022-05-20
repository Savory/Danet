import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-1/mod.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import {
	InjectableConstructor,
	TokenInjector,
} from '../injector/injectable/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { ModuleConstructor } from './constructor.ts';

export class ModuleOptions {
	imports?: Array<ModuleConstructor> = [];
	controllers?: ControllerConstructor[] = [];
	injectables?: Array<InjectableConstructor | TokenInjector> = [];
}

export const moduleMetadataKey = 'module';

export function Module<T>(options: ModuleOptions) {
	return (Type: Constructor<T>): void => {
		MetadataHelper.setMetadata(moduleMetadataKey, options, Type);
	};
}
