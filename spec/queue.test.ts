import {
	Controller,
	DanetApplication,
	Get,
	KvQueue,
	KvQueueModule,
	Module,
	OnEvent,
	OnQueueMessage,
} from '../mod.ts';
import {
	assertEquals,
	assertSpyCall,
	assertThrows,
	spy,
} from '../src/deps_test.ts';

const sleep = (msec: number) =>
	new Promise((resolve) => setTimeout(resolve, msec));

Deno.test('Queue Module', async (t) => {
	const callback = spy((_payload: any) => {});
	const secondCallback = spy((_payload: any) => {});
	const payload = { name: 'test' };

	class TestListener {
		@OnQueueMessage('trigger')
		getSomething(payload: any) {
			callback(payload);
		}

		@OnQueueMessage('another-trigger')
		getSomethingAgain(payload: any) {
			secondCallback(payload);
		}
	}

	@Controller('trigger')
	class TestController {
		constructor(private queue: KvQueue) {}

		@Get()
		getSomething() {
			this.queue.sendMessage('trigger', payload);
			return 'OK';
		}

		@Get('again')
		getSomethingAgain() {
			this.queue.sendMessage('another-trigger', 'toto');
			return 'OK';
		}
	}

	@Module({
		imports: [KvQueueModule.forRoot()],
		controllers: [TestController],
		injectables: [TestListener],
	})
	class TestModule {}

	const application = new DanetApplication();
	await application.init(TestModule);
	const listenerInfo = await application.listen(0);

	await t.step('validate if api call send message in queue', async () => {
		assertEquals(callback.calls.length, 0);

		let res = await fetch(`http://localhost:${listenerInfo.port}/trigger`);

		assertEquals(res.status, 200);
		assertEquals(await res.text(), 'OK');

		await sleep(500);
		assertEquals(callback.calls.length, 1);
		assertSpyCall(callback, 0, {
			args: [payload],
		});

		res = await fetch(`http://localhost:${listenerInfo.port}/trigger/again`);

		assertEquals(res.status, 200);
		assertEquals(await res.text(), 'OK');
		await sleep(500);
		assertEquals(secondCallback.calls.length, 1);
		assertSpyCall(secondCallback, 0, {
			args: ['toto'],
		});
	});

	await application.close();
});
