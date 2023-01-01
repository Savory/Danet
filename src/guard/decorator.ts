import { Constructor } from '../utils/constructor.ts';
import { SetMetadata } from '../metadata/decorator.ts';

export const guardMetadataKey = 'authGuards';
export const UseGuard = (guard: Constructor) =>
	SetMetadata(guardMetadataKey, guard);
