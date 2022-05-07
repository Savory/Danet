import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { ControllerConstructor } from '../../router/controller/constructor.ts';
import { Constructor } from '../../utils/constructor.ts';

export const filterException = 'filterException';
// deno-lint-ignore no-explicit-any ban-types
export const UseFilter = (guard: Constructor) => (target: ControllerConstructor | Object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
  const guardInstance = new guard();
  if (propertyKey && descriptor)
    Reflect.defineMetadata(filterException, guardInstance, descriptor.value);
  else
    Reflect.defineMetadata(filterException, guardInstance, target);
}
