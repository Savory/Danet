
import { MetadataHelper } from '../metadata/helper.ts';

export const injectionTokenMetadataKey = 'injection-token';

export function getInjectionTokenMetadataKey(parameterIndex: number) {
  return `${injectionTokenMetadataKey}:${parameterIndex}`;
}

export const Inject = (token: string) => (target: Record<string, unknown>, propertyKey: string | symbol, parameterIndex: number) => {
  MetadataHelper.setMetadata(getInjectionTokenMetadataKey(parameterIndex), token, target);
}
