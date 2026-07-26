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
import { assertSpyCallArg, FakeTime, spy, stub } from '../src/deps_test.ts';

Deno.test('Schedule Module', async (t) => {
	using cronStub = stub(Deno, 'cron', spy() as unknown as typeof Deno.cron);

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
		assertSpyCallArg(cronStub, 0, 0, 'runEachMinute');
		assertSpyCallArg(cronStub, 0, 1, CronExpression.EVERY_MINUTE);
	});

	await application.close();
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
