import {
	Cron,
	CronExpression,
	DanetApplication,
	Interval,
	IntervalExpression,
	Module,
	ScheduleModule,
	Timeout,
} from '../mod.ts';
import { assertEquals } from '../src/deps_test.ts';
import { assertSpyCallArg, FakeTime, spy } from '../src/deps_test.ts';

Deno.test('Schedule Module', async (t) => {
	const cronSpy = spy();
	// Deno exposes `Deno.cron` as a getter-only property on some builds, where a
	// plain `Deno.cron = ...` assignment throws. Redefining the property works in
	// both shapes, and we put the original descriptor back in a `finally` so a
	// failing step cannot leak the stub into the rest of the suite.
	const originalCron = Object.getOwnPropertyDescriptor(Deno, 'cron');
	Object.defineProperty(Deno, 'cron', {
		value: cronSpy,
		writable: true,
		configurable: true,
	});

	try {
		class TestListener {
			@Cron(CronExpression.EVERY_MINUTE)
			runEachMinute() {}
		}

		@Module({
			imports: [ScheduleModule],
			injectables: [TestListener],
		})
		class TestModule {}

		const application = new DanetApplication();
		await application.init(TestModule);
		await application.listen(0);

		await t.step('cronjob was called', () => {
			assertSpyCallArg(cronSpy, 0, 0, 'runEachMinute');
			assertSpyCallArg(cronSpy, 0, 1, CronExpression.EVERY_MINUTE);
		});

		await application.close();
	} finally {
		if (originalCron) {
			Object.defineProperty(Deno, 'cron', originalCron);
		} else {
			// deno-lint-ignore no-explicit-any
			delete (Deno as any).cron;
		}
	}
});

Deno.test('Timeout Module', async (t) => {
	const time = new FakeTime();
	const cb = spy();

	class TestListener {
		@Timeout(IntervalExpression.MILISECOND)
		runEachMinute() {
			cb();
		}
	}

	@Module({
		imports: [ScheduleModule],
		injectables: [TestListener],
	})
	class TestModule {}

	const application = new DanetApplication();
	await application.init(TestModule);
	await application.listen(0);

	await t.step('should be called once after tick', async () => {
		await time.tickAsync(IntervalExpression.MILISECOND);
		assertEquals(cb.calls.length, 1);

		await time.tickAsync(IntervalExpression.MILISECOND);
		assertEquals(cb.calls.length, 1);
	});

	await application.close();
});

Deno.test('Interval Module', async (t) => {
	const time = new FakeTime();
	const cb = spy();

	class TestListener {
		@Interval(IntervalExpression.MILISECOND)
		runEachMinute() {
			cb();
		}
	}

	@Module({
		imports: [ScheduleModule],
		injectables: [TestListener],
	})
	class TestModule {}

	const application = new DanetApplication();
	await application.init(TestModule);
	await application.listen(0);

	await t.step('should be called once after tick', async () => {
		await time.tickAsync(IntervalExpression.MILISECOND);
		assertEquals(cb.calls.length, 1);

		await time.tickAsync(IntervalExpression.MILISECOND);
		assertEquals(cb.calls.length, 2);

		await time.tickAsync(IntervalExpression.MILISECOND);
		assertEquals(cb.calls.length, 3);
	});

	await application.close();
});
