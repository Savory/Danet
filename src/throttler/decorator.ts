import { MetadataFunction, SetMetadata } from '../metadata/decorator.ts';

export const throttleMetadataKey = 'throttle';

/**
 * Options for throttle metadata.
 */
export interface ThrottleOptions {
  limit: number;
  ttl?: number; // seconds
}

/**
 * Apply throttle options to controller or handler.
 * @param limit number of requests
 * @param ttl seconds window
 */
export function Throttle(limit: number, ttl = 60): MetadataFunction {
  return SetMetadata(throttleMetadataKey, { limit, ttl } as ThrottleOptions);
}
