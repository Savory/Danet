import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';

export const injectionTokenMetadataKey = 'injection-token';

export function getInjectionTokenMetadataKey(parameterIndex: number) {
  return `${injectionTokenMetadataKey}:${parameterIndex}`;
}

export const Inject = (token: string) => (target: Record<string, unknown>, propertyKey: string | symbol, parameterIndex: number) => {
  Reflect.defineMetadata(getInjectionTokenMetadataKey(parameterIndex), token, target);
}
