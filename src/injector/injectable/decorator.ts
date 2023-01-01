import { SetMetadata } from '../../metadata/decorator.ts';

export enum SCOPE {
	GLOBAL = 'GLOBAL',
	REQUEST = 'REQUEST',
}

export interface InjectableOption {
	scope: SCOPE;
}

export const injectionData = 'dependency-injection';

export const Injectable = <T>(
	options: InjectableOption = { scope: SCOPE.GLOBAL },
) => SetMetadata(injectionData, options);
