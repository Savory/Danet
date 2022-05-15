import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Constructor } from '../../utils/constructor.ts';

export const filterExceptionMetadataKey = 'filterException';
// deno-lint-ignore no-explicit-any ban-types
export const UseFilter = (guard: Constructor) => (target: ControllerConstructor | Object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
  const guardInstance = new guard();
  if (propertyKey && descriptor)
    Reflect.defineMetadata(filterExceptionMetadataKey, guardInstance, descriptor.value);
  else
    Reflect.defineMetadata(filterExceptionMetadataKey, guardInstance, target);
}

export const filterCatchTypeMetadataKey = 'filterException';
export function Catch<T>(ErrorType: Constructor) {
  return (Type: Constructor<T>): void => {
    Reflect.defineMetadata(filterCatchTypeMetadataKey, ErrorType, Type);
  };
}
