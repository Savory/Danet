import { Constructor } from '../../utils/constructor.ts';
import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';

export const filterExceptionMetadataKey = 'filterException';
export function UseFilter(filter: Constructor): MetadataFunction {
	return SetMetadata(filterExceptionMetadataKey, filter);
}
export const filterCatchTypeMetadataKey = 'errorCaught';
export function Catch(ErrorType: Constructor): MetadataFunction {
	return	SetMetadata(filterCatchTypeMetadataKey, ErrorType);
}