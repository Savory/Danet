import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { InjectableConstructor, TokenInjector } from '../injector/injectable/constructor.ts';
import { Constructor } from '../utils/constructor.ts';
import { ModuleConstructor } from './constructor.ts';

export class ModuleOptions {
  imports?: ModuleConstructor[] = [];
  controllers: ControllerConstructor[] = [];
  injectables: Array<InjectableConstructor | TokenInjector> = [];
}

export const moduleMetadataKey = 'module';

export function Module<T>(options: ModuleOptions) {
  return (Type: Constructor<T>): void => {
    Reflect.defineMetadata(moduleMetadataKey, options, Type)
  };
}
