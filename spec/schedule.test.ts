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
import {
	assertSpyCall,
	assertSpyCallArg,
	FakeTime,
	spy,
} from '../src/deps_test.ts';

Deno.test('Schedule Module', async (t) => {
	const cron = Deno.cron;
	// @ts-ignore:next-line
	Deno.cron = spy();

	class TestListener {
		@Cron(CronExpression.EVERY_MINUTE)
		runEachMinute() {}
	}
	// TODO: add tests for @Interval & @Timeout

	@Module({
		imports: [ScheduleModule],
		injectables: [TestListener],
	})
	class TestModule {}

	const application = new DanetApplication();
	await application.init(TestModule);
	await application.listen(0);

	await t.step('cronjob was called', () => {
		// @ts-ignore:next-line
		assertSpyCallArg(Deno.cron, 0, 0, 'runEachMinute');
		// @ts-ignore:next-line
		assertSpyCallArg(Deno.cron, 0, 1, CronExpression.EVERY_MINUTE);
	});

	await application.close();
	Deno.cron = cron;
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
