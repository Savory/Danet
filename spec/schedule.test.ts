import {
	assertSpyCall,
	assertSpyCallArg,
	spy,
} from 'https://deno.land/std@0.135.0/testing/mock.ts';
import {
	Cron,
	CronExpression,
	DanetApplication,
	IntervalExpression,
	Module,
	ScheduleModule,
} from '../mod.ts';

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
