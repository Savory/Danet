import {
	DanetApplication,
	Interval,
	KvQueueModule,
	Module,
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
});
