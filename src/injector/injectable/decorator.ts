import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { Constructor } from '../../utils/constructor.ts';

export enum SCOPE {
  GLOBAL = 'GLOBAL',
  REQUEST = 'REQUEST'
}

export interface InjectableOption {
  scope: SCOPE
}

export const dependencyInjectionMetadataKey = "dependency-injection";

export function Injectable<T>(options: InjectableOption = { scope: SCOPE.GLOBAL }) {
  return (Type: Constructor<T>): void => {
    Reflect.defineMetadata(dependencyInjectionMetadataKey, options, Type);
  };
}
