import { Reflect } from '../deps.ts';

export class MetadataHelper {
	static IsObject<T>(
		x: T | undefined | null | boolean | string | symbol | number,
	): x is T {
		return typeof x === 'object' ? x !== null : typeof x === 'function';
	}

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
