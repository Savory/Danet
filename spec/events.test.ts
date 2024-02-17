import { EventEmitter } from '../mod.ts';
import {
	assertEquals,
	assertSpyCall,
	assertThrows,
	spy,
} from '../src/deps_test.ts';

Deno.test('EventEmitter Service', async (t) => {
	await t.step('subscribe multiple listeners for the same topic', async () => {
		const emitter = new EventEmitter();
		const fn1 = spy(() => {});
		const fn2 = spy(() => {});

		emitter.subscribe('test', fn1);
		emitter.subscribe('test', fn2);

		emitter.emit('test', 'something');

		assertSpyCall(fn1, 0, {
			args: ['something'],
			returned: undefined,
		});

		assertSpyCall(fn2, 0, {
			args: ['something'],
			returned: undefined,
		});

		emitter.unsubscribe();
	});

	await t.step('subscribe listeners for the multiple topics', async () => {
		const emitter = new EventEmitter();
		const fn1 = spy(() => {});
		const fn2 = spy(() => {});

		emitter.subscribe('test', fn1);
		emitter.subscribe('test-2', fn2);

		emitter.emit('test', 'something');

		assertSpyCall(fn1, 0, {
			args: ['something'],
			returned: undefined,
		});

		assertEquals(fn2.calls.length, 0);

		emitter.emit('test-2', 'something');

		assertSpyCall(fn2, 0, {
			args: ['something'],
			returned: undefined,
		});

		assertEquals(fn1.calls.length, 1);

		emitter.unsubscribe();
	});

	await t.step('throw error if emit an event with no listener', async () => {
		const emitter = new EventEmitter();
		const fn1 = spy(() => {});

		assertThrows(() => emitter.emit('test', 'something'));

		emitter.subscribe('test', fn1);

		assertEquals(fn1.calls.length, 0);

		emitter.emit('test', 'something');

		assertSpyCall(fn1, 0, {
			args: ['something'],
			returned: undefined,
		});

		emitter.unsubscribe();
	});

	await t.step('throw error if emit to a unsubscribed topic', async () => {
		const emitter = new EventEmitter();
		const fn1 = spy(() => {});

		assertEquals(fn1.calls.length, 0);

		emitter.subscribe('test', fn1);
		emitter.emit('test', 'something');

		assertSpyCall(fn1, 0, {
			args: ['something'],
			returned: undefined,
		});

		emitter.unsubscribe('test');

		assertThrows(() => emitter.emit('test', 'something'));
		assertEquals(fn1.calls.length, 1);

		emitter.unsubscribe();
	});
});
