import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';

export enum SCOPE {
	GLOBAL = 'GLOBAL',
	REQUEST = 'REQUEST',
	TRANSIENT = 'TRANSIENT',
}

export interface InjectableOption {
	scope: SCOPE;
}

export const injectionData = 'dependency-injection';

export function Injectable<T>(
	options: InjectableOption = { scope: SCOPE.GLOBAL },
): MetadataFunction {
	return SetMetadata(injectionData, options)
}