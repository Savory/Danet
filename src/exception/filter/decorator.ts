import { Constructor } from '../../utils/constructor.ts';
import { MetadataFunction, SetMetadata } from '../../metadata/decorator.ts';

export const filterExceptionMetadataKey = 'filterException';
/**
 * A decorator function that applies a specified filter to the metadata of a class or method.
 *
 * @param filter - The constructor of the filter to be applied.
 * @returns A function that sets the metadata for the filter.
 */
export function UseFilter(filter: Constructor): MetadataFunction {
	return SetMetadata(filterExceptionMetadataKey, filter);
}
export const filterCatchTypeMetadataKey = 'errorCaught';
/**
 * A decorator function to specify the error type to catch for an exception filter.
 *
 * @param ErrorType - The constructor of the error type to catch.
 * @returns A metadata function that sets the metadata for the error type to catch.
 */
export function Catch(ErrorType: Constructor): MetadataFunction {
	return	SetMetadata(filterCatchTypeMetadataKey, ErrorType);
}