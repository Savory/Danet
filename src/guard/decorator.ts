import { Constructor } from '../utils/constructor.ts';
import { MetadataFunction, SetMetadata } from '../metadata/decorator.ts';

export const guardMetadataKey = 'authGuards';
/**
 * Applies a guard to a route handler or controller.
 * 
 * https://danet.land/overview/guards.html
 * 
 * @param guard - The constructor of the guard to be applied.
 * @returns A function that sets the metadata for the guard.
 */
export function UseGuard(guard: Constructor): MetadataFunction {
	return SetMetadata(guardMetadataKey, guard);
}
