import { Cron, DanetApplication, Module, ScheduleModule } from '../mod.ts';
import { assertEquals, assertSpyCall } from '../src/deps_test.ts';

const TIMEOUT = 1000 * 60 * 1.1; // 1.1 min

Deno.test('Schedule Module', async (t) => {
	const initialMinute = new Date().getMinutes();
	let callbackCalledMinute: number = -1;

	class TestListener {
		@Cron('*/1 * * * *')
		runEachMinute() {
			callbackCalledMinute = new Date().getMinutes();
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

	await t.step('call funciton on the next minute', async () => {
		let timeoutId = -1;
		let intervalId = -1;

		const calledAt = await new Promise((res, rej) => {
			timeoutId = setTimeout(
				() => rej({ msg: 'timed out', callbackCalledMinute }),
				TIMEOUT,
			);

			intervalId = setInterval(() => {
				if (callbackCalledMinute !== -1) {
					res(callbackCalledMinute);
				}
			}, 300);
		});

		assertEquals(calledAt, initialMinute + 1);

		clearTimeout(timeoutId);
		clearInterval(intervalId);
	});

	await application.close();
});
