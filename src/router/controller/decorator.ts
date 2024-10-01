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
type MappingDecoratorFunction = ((endpoint?: string) => MethodDecorator);

function createMappingDecorator(method?: HttpMethod): MappingDecoratorFunction {
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

export const Get: MappingDecoratorFunction = createMappingDecorator('GET');
export const Post: MappingDecoratorFunction = createMappingDecorator('POST');
export const Put: MappingDecoratorFunction = createMappingDecorator('PUT');
export const Patch: MappingDecoratorFunction = createMappingDecorator('PATCH');
export const Delete: MappingDecoratorFunction = createMappingDecorator('DELETE');
export const Options: MappingDecoratorFunction = createMappingDecorator('OPTIONS');
export const Head: MappingDecoratorFunction = createMappingDecorator('HEAD');
export const All: MappingDecoratorFunction = createMappingDecorator();
export const SSE: MappingDecoratorFunction = (endpoint = ''): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata('endpoint', endpoint, descriptor.value);
		MetadataHelper.setMetadata('method', 'GET', descriptor.value);
		MetadataHelper.setMetadata('SSE', true, descriptor.value);
		return descriptor;
	};
};
