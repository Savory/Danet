import { Constructor } from '../utils/constructor.ts';
import { MetadataFunction, SetMetadata } from '../metadata/decorator.ts';

export const guardMetadataKey = 'authGuards';
export function UseGuard(guard: Constructor): MetadataFunction {
	return SetMetadata(guardMetadataKey, guard);
}
