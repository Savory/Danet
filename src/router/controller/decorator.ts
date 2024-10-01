import { MetadataHelper } from '../../metadata/helper.ts';
import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';
export type HttpMethod =
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'OPTIONS'
	| 'HEAD';

export function Controller<T>(endpoint = ''): MetadataFunction {
	return SetMetadata('endpoint', endpoint);
}
function createMappingDecorator(method?: HttpMethod): ((endpoint: string) => MethodDecorator) {
	return (endpoint = ''): MethodDecorator => {
		return (_target, _propertyKey, descriptor) => {
			MetadataHelper.setMetadata('endpoint', endpoint, descriptor.value);
			if (method) {
				MetadataHelper.setMetadata('method', method, descriptor.value);
			}
			return descriptor;
		};
	};
}

export const Get: ((endpoint: string) => MethodDecorator) = createMappingDecorator('GET');
export const Post: ((endpoint: string) => MethodDecorator) = createMappingDecorator('POST');
export const Put: ((endpoint: string) => MethodDecorator) = createMappingDecorator('PUT');
export const Patch: ((endpoint: string) => MethodDecorator) = createMappingDecorator('PATCH');
export const Delete: ((endpoint: string) => MethodDecorator) = createMappingDecorator('DELETE');
export const Options: ((endpoint: string) => MethodDecorator) = createMappingDecorator('OPTIONS');
export const Head: ((endpoint: string) => MethodDecorator) = createMappingDecorator('HEAD');
export const All: ((endpoint: string) => MethodDecorator) = createMappingDecorator();
export const SSE: ((endpoint: string) => MethodDecorator) = (endpoint = ''): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata('endpoint', endpoint, descriptor.value);
		MetadataHelper.setMetadata('method', 'GET', descriptor.value);
		MetadataHelper.setMetadata('SSE', true, descriptor.value);
		return descriptor;
	};
};
