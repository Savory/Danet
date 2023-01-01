import { MetadataHelper } from '../../metadata/helper.ts';
import { SetMetadata } from '../../metadata/decorator.ts';
export type HttpMethod =
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'OPTIONS'
	| 'HEAD';

export const Controller = <T>(endpoint = '') =>
	SetMetadata('endpoint', endpoint);
function createMappingDecorator(method?: HttpMethod) {
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

export const Get = createMappingDecorator('GET');
export const Post = createMappingDecorator('POST');
export const Put = createMappingDecorator('PUT');
export const Patch = createMappingDecorator('PATCH');
export const Delete = createMappingDecorator('DELETE');
export const Options = createMappingDecorator('OPTIONS');
export const Head = createMappingDecorator('HEAD');
export const All = createMappingDecorator();
