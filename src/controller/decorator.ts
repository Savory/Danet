import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/mod.ts';
import { Constructor } from '../utils/constructor.ts';
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function Controller<T>(endpoint = '') {
  return (Type: Constructor<T>): void => {
    Reflect.defineMetadata('endpoint', endpoint, Type);
  };
}
function createMappingDecorator(method: HttpMethod) {
  return (endpoint: string): MethodDecorator => {
    return (_target, _propertyKey, descriptor) => {
      Reflect.defineMetadata("endpoint", endpoint, descriptor.value);
      Reflect.defineMetadata("method", method, descriptor.value);
      return descriptor;
    };
  };
}

export const Get = createMappingDecorator("GET");
export const Post = createMappingDecorator("POST");
export const Put = createMappingDecorator("PUT");
export const Patch = createMappingDecorator("PATCH");
export const Delete = createMappingDecorator("DELETE");
