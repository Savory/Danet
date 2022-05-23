import { Reflect } from '../deps.ts';

export class MetadataHelper {
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
	) {
		if (property) {
			return Reflect.defineMetadata(key, value, target, property);
		}
		return Reflect.defineMetadata(key, value, target);
	}
}
