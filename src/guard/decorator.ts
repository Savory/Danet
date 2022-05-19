
import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { Constructor } from '../utils/constructor.ts';

export const guardMetadataKey = 'authGuards';
// deno-lint-ignore no-explicit-any ban-types
export const UseGuard = (guard: Constructor) => (target: ControllerConstructor | Object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
  const guardInstance = new guard();
  if (propertyKey && descriptor)
    MetadataHelper.setMetadata(guardMetadataKey, guardInstance, descriptor.value);
  else
    MetadataHelper.setMetadata(guardMetadataKey, guardInstance, target);
}
