import {
	DanetApplication,
	EventEmitter,
	EventEmitterModule,
	Interval,
	KvQueueModule,
	Module,
	OnEvent,
	ScheduleModule,
} from '../mod.ts';
import { assertEquals, assertSpyCalls, spy } from '../src/deps_test.ts';

const sleep = (msec: number) =>
	new Promise((resolve) => setTimeout(resolve, msec));

Deno.test('ScheduleModule ignores plain-value injectables', async (t) => {
	const tick = spy(() => {});

	class Ticker {
		@Interval(50)
		onTick() {
			tick();
		}
	}

	await t.step('boots alongside a `useValue` string injectable', async () => {
		@Module({
			imports: [ScheduleModule],
			injectables: [
				{ token: 'SOME_PLAIN_VALUE', useValue: './some/path' },
				Ticker,
			],
		})
		class StringValueModule {}

		const application = new DanetApplication();
		try {
			await application.init(StringValueModule);
			await sleep(120);
			assertEquals(tick.calls.length > 0, true);
		} finally {
			await application.close();
		}
	});

	await t.step(
		'boots alongside an undefined `useValue` injectable',
		async () => {
			@Module({
				imports: [ScheduleModule],
				injectables: [{ token: 'UNDEFINED_VALUE', useValue: undefined }],
			})
			class UndefinedValueModule {}

			const application = new DanetApplication();
			try {
				await application.init(UndefinedValueModule);
			} finally {
				await application.close();
			}
		},
	);

	await t.step('boots alongside KvQueueModule', async () => {
		const queueTick = spy(() => {});

		class QueueTicker {
			@Interval(50)
			onTick() {
				queueTick();
			}
		}

		@Module({
			imports: [ScheduleModule, KvQueueModule.forRoot()],
			injectables: [QueueTicker],
		})
		class BothModules {}

		const application = new DanetApplication();
		try {
			await application.init(BothModules);
			await sleep(120);
			assertSpyCalls(queueTick, queueTick.calls.length);
			assertEquals(queueTick.calls.length > 0, true);
		} finally {
			await application.close();
		}
	});

	// A plain OBJECT `useValue` is the case the string/undefined steps above do
	// not reach: it passes the `IsObject` guard, so the scanning modules walk
	// `Object.prototype`'s own property names. Since Deno 2.9 that list includes
	// `__proto__`, which reads back as a non-object and made
	// `Reflect.getMetadata` throw a bare TypeError during `init`.
	await t.step('boots alongside an object `useValue` injectable', async () => {
		const objectTick = spy(() => {});

		class ObjectTicker {
			@Interval(50)
			onTick() {
				objectTick();
			}
		}

		@Module({
			imports: [ScheduleModule],
			injectables: [
				{ token: 'SOME_OPTIONS', useValue: { url: 'amqp://localhost' } },
				ObjectTicker,
			],
		})
		class ObjectValueModule {}

		const application = new DanetApplication();
		try {
			await application.init(ObjectValueModule);
			await sleep(120);
			assertEquals(objectTick.calls.length > 0, true);
		} finally {
			await application.close();
		}
	});
});

Deno.test('Scanning modules ignore object plain-value injectables', async (t) => {
	const PLAIN_OBJECT = {
		token: 'SOME_OPTIONS',
		useValue: { url: 'amqp://localhost' },
	};

	await t.step(
		'KvQueueModule boots and still wires its listeners',
		async () => {
			const queueTick = spy(() => {});

			class QueueListener {
				@Interval(50)
				onTick() {
					queueTick();
				}
			}

			@Module({
				imports: [ScheduleModule, KvQueueModule.forRoot()],
				injectables: [PLAIN_OBJECT, QueueListener],
			})
			class KvModule {}

			const application = new DanetApplication();
			try {
				await application.init(KvModule);
				await sleep(120);
				assertEquals(queueTick.calls.length > 0, true);
			} finally {
				await application.close();
			}
		},
	);

	await t.step(
		'EventEmitterModule boots and still delivers events',
		async () => {
			const onSomething = spy(() => {});

			class EventListener {
				@OnEvent('something')
				handle() {
					onSomething();
				}
			}

			@Module({
				imports: [EventEmitterModule],
				injectables: [PLAIN_OBJECT, EventListener],
			})
			class EventsModule {}

			const application = new DanetApplication();
			try {
				await application.init(EventsModule);
				const emitter = await application.get<EventEmitter>(EventEmitter);
				emitter.emit('something', {});
				await sleep(50);
				assertEquals(onSomething.calls.length > 0, true);
			} finally {
				await application.close();
			}
		},
	);

	await t.step(
		'EventEmitterModule tolerates primitive and undefined values',
		async () => {
			@Module({
				imports: [EventEmitterModule],
				injectables: [
					{ token: 'A_STRING', useValue: './some/path' },
					{ token: 'UNDEFINED_VALUE', useValue: undefined },
				],
			})
			class PrimitiveValuesModule {}

			const application = new DanetApplication();
			try {
				await application.init(PrimitiveValuesModule);
			} finally {
				await application.close();
			}
		},
	);
});
