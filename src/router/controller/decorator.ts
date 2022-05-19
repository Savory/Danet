import { MetadataHelper } from '../../metadata/helper.ts';
import { Constructor } from '../../utils/constructor.ts';
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function Controller<T>(endpoint = '') {
  return (Type: Constructor<T>): void => {
    MetadataHelper.setMetadata('endpoint', endpoint, Type);
  };
}
function createMappingDecorator(method: HttpMethod) {
  return (endpoint = ''): MethodDecorator => {
    return (_target, _propertyKey, descriptor) => {
      MetadataHelper.setMetadata("endpoint", endpoint, descriptor.value);
      MetadataHelper.setMetadata("method", method, descriptor.value);
      return descriptor;
    };
  };
}

export const Get = createMappingDecorator("GET");
export const Post = createMappingDecorator("POST");
export const Put = createMappingDecorator("PUT");
export const Patch = createMappingDecorator("PATCH");
export const Delete = createMappingDecorator("DELETE");
