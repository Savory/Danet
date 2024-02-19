import { Cron, DanetApplication, Module, ScheduleModule } from '../mod.ts';

class TaskScheduler {
	constructor() {
		this.runEachMinute.bind(this);
		this.runEach2Min.bind(this);
		this.runEach3Min.bind(this);
	}

	getNow() {
		return {
			now: new Date(),
		};
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
