/* 
** metadata
** Provides metadata helper functions
** Dependencies: Reflect
** @module
*/

import { Reflect } from '../deps.ts';

export class MetadataHelper {

	/**
	 * Determines if the provided value is an object.
	 *
	 * This function checks if the given value is of type 'object' and not null,
	 * or if it is of type 'function'.
	 *
	 * @template T - The type of the value being checked.
	 * @param x - The value to check. It can be of type T, undefined, null, boolean, string, symbol, or number.
	 * @returns A boolean indicating whether the value is an object.
	 */
	static IsObject<T>(
		x: T | undefined | null | boolean | string | symbol | number,
	): x is T {
		return typeof x === 'object' ? x !== null : typeof x === 'function';
	}

	/**
	 * Retrieves metadata of a specified key from an object or its property.
	 *
	 * @template T - The expected type of the metadata value.
	 * @param {string} key - The key for the metadata to retrieve.
	 * @param {unknown} obj - The target object from which to retrieve the metadata.
	 * @param {string | symbol} [property] - Optional. The property of the object from which to retrieve the metadata.
	 * @returns {T} - The metadata value associated with the specified key.
	 */
	static getMetadata<T>(
		key: string,
		obj: unknown,
		property?: string | symbol,
	): T {
		if (property) {
			return Reflect.getOwnMetadata(key, obj, property);
		}
		return Reflect.getMetadata(key, obj) as T;
	}

	/**
	 * Sets metadata for a target object or its property.
	 *
	 * @param key - The metadata key.
	 * @param value - The metadata value.
	 * @param target - The target object to set the metadata on.
	 * @param property - Optional. The property of the target object to set the metadata on.
	 * If not provided, the metadata is set on the target object itself.
	 * 
	 * @returns void
	 */
	static setMetadata(
		key: string,
		value: unknown,
		target: unknown,
		property?: string | symbol,
	): void {
		if (property) {
			return Reflect.defineMetadata(key, value, target, property);
		}
		return Reflect.defineMetadata(key, value, target);
	}
}
