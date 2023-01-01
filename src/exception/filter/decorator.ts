import { Constructor } from '../../utils/constructor.ts';
import { SetMetadata } from '../../metadata/decorator.ts';

export const filterExceptionMetadataKey = 'filterException';
export const UseFilter = (filter: Constructor) => SetMetadata(filterExceptionMetadataKey, filter);
export const filterCatchTypeMetadataKey = 'errorCaught';
export const Catch = (ErrorType: Constructor) => SetMetadata(filterCatchTypeMetadataKey, ErrorType);
