import {
	Cron,
	DanetApplication,
	Interval,
	IntervalExpression,
	Module,
	ScheduleModule,
	Timeout,
} from '../mod.ts';

class TaskScheduler {
	getNow() {
		return {
			now: new Date(),
		};
	}

	@Timeout(IntervalExpression.SECOND)
	runOnce() {
		console.log('run once after 1s', this.getNow());
	}

	@Interval(IntervalExpression.SECOND)
	runEachSecond() {
		console.log('1 sec', this.getNow());
	}

	@Cron('*/1 * * * *')
	runEachMinute() {
		console.log('1 minute', this.getNow());
	}

	@Cron('*/2 * * * *')
	runEach2Min() {
		console.log('2 minutes', this.getNow());
	}

	@Cron('*/3 * * * *')
	runEach3Min() {
		console.log('3 minutes', this.getNow());
	}
}

@Module({
	imports: [ScheduleModule],
	injectables: [TaskScheduler],
})
class AppModule {}

const app = new DanetApplication();
await app.init(AppModule);

let port = Number(Deno.env.get('PORT'));
if (isNaN(port)) {
	port = 3000;
}
app.listen(port);
