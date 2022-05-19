
import { MetadataHelper } from '../../metadata/helper.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Constructor } from '../../utils/constructor.ts';

export const filterExceptionMetadataKey = 'filterException';
// deno-lint-ignore no-explicit-any ban-types
export const UseFilter = (guard: Constructor) => (target: ControllerConstructor | Object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
  const guardInstance = new guard();
  if (propertyKey && descriptor)
    MetadataHelper.setMetadata(filterExceptionMetadataKey, guardInstance, descriptor.value);
  else
    MetadataHelper.setMetadata(filterExceptionMetadataKey, guardInstance, target);
}

export const filterCatchTypeMetadataKey = 'filterException';
export function Catch<T>(ErrorType: Constructor) {
  return (Type: Constructor<T>): void => {
    MetadataHelper.setMetadata(filterCatchTypeMetadataKey, ErrorType, Type);
  };
}
