
import { MetadataHelper } from '../../metadata/helper.ts';
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
    MetadataHelper.setMetadata(dependencyInjectionMetadataKey, options, Type);
  };
}
