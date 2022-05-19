import { assert } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Constructor } from './constructor.ts';

function assertInstanceOf<T>(value: T, type: Constructor<T>) {
	assert(value instanceof type, `${value} is not of type ${type.name}`);
}
