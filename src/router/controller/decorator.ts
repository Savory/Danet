import { MetadataHelper } from '../../metadata/helper.ts';
import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';
/**
 * Represents the HTTP methods that can be used in routing.
 *
 * @typedef {('GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD')} HttpMethod
 *
 * @example
 * // Example usage:
 * const method: HttpMethod = 'GET';
 */
export type HttpMethod =
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE'
	| 'OPTIONS'
	| 'HEAD';

/**
 * Decorate a class to make it an HTTP Controller.
 *
 * @template T - The type parameter for the controller.
 * @param {string} [endpoint=''] - The endpoint for the controller. Defaults to an empty string.
 * @returns {MetadataFunction} - A function that sets the metadata for the endpoint.
 */
export function Controller<T>(endpoint = ''): MetadataFunction {
	return SetMetadata('endpoint', endpoint);
}
type MappingDecoratorFunction = (endpoint?: string) => MethodDecorator;

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

/**
 * Define a method as a GET request handler.
 *
 * This decorator can be used to annotate controller methods to handle HTTP GET requests.
 *
 * @example
 * ```typescript
 * @Get('/path')
 * public getMethod(): string {
 *   return 'This is a GET request';
 * }
 * ```
 *
 * @type {MappingDecoratorFunction}
 */
export const Get: MappingDecoratorFunction = createMappingDecorator('GET');
/**
 * Define a method as a POST request handler .
 *  * @example
 * ```typescript
 * @Post('/path')
 * public myMethod(): string {
 *   return 'This is a POST request';
 * }
 * ```
 */
export const Post: MappingDecoratorFunction = createMappingDecorator('POST');
/**
 * Define a method as a PUT request handler .
 *  * @example
 * ```typescript
 * @Put('/path')
 * public myMethod(): string {
 *   return 'This is a PUT request';
 * }
 * ```
 */
export const Put: MappingDecoratorFunction = createMappingDecorator('PUT');
/**
 * Define a method as a PATCH request handler .
 *  * @example
 * ```typescript
 * @Patch('/path')
 * public myMethod(): string {
 *   return 'This is a PATCH request';
 * }
 * ```
 */
export const Patch: MappingDecoratorFunction = createMappingDecorator('PATCH');
/**
 * Define a method as a DELETE request handler .
 *  * @example
 * ```typescript
 * @Delete('/path')
 * public myMethod(): string {
 *   return 'This is a DELETE request';
 * }
 * ```
 */
export const Delete: MappingDecoratorFunction = createMappingDecorator(
	'DELETE',
);
/**
 * Define a method as an OPTIONS request handler .
 *  * @example
 * ```typescript
 * @Options('/path')
 * public myMethod(): string {
 *   return 'This is a OPTIONS request';
 * }
 * ```
 */
export const Options: MappingDecoratorFunction = createMappingDecorator(
	'OPTIONS',
);
/**
 * Define a method as an HEAD request handler .
 *  * @example
 * ```typescript
 * @Head('/path')
 * public myMethod(): string {
 *   return 'This is a HEAD request';
 * }
 * ```
 */
export const Head: MappingDecoratorFunction = createMappingDecorator('HEAD');
/**
 * Define a method as a request handler for all HTTP METHOD .
 *  * @example
 * ```typescript
 * @All('/path')
 * public myMethod(): string {
 *   return 'This is potentially a GET || POST || OPTIONS || HEAD || PATCH || DELETE || PUT request';
 * }
 * ```
 */
export const All: MappingDecoratorFunction = createMappingDecorator();
/**
 * Define a method as a request handler that will send event with SSE.
 *  * @example
 * ```typescript
 * @SSE('/path')
 * public myMethod(): eventTarget {
 *  const eventTarget = new EventTarget();
		let id = 0;
		const interval = setInterval(() => {
			if (id >= 4) {
				clearInterval(interval);
				const event = new SSEEvent({
					retry: 1000,
					id: `${id}`,
					data: 'close',
					event: 'close',
				});
				eventTarget.dispatchEvent(event);
				return;
			}
			const event = new SSEEvent({
				retry: 1000,
				id: `${id}`,
				data: 'world',
				event: 'hello',
			});
			eventTarget.dispatchEvent(event);
			id++;
		}, 100);
		return eventTarget;
 * }
 * ```
 */
export const SSE: MappingDecoratorFunction = (
	endpoint = '',
): MethodDecorator => {
	return (_target, _propertyKey, descriptor) => {
		MetadataHelper.setMetadata('endpoint', endpoint, descriptor.value);
		MetadataHelper.setMetadata('method', 'GET', descriptor.value);
		MetadataHelper.setMetadata('SSE', true, descriptor.value);
		return descriptor;
	};
};
