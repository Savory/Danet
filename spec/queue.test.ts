import {
	Controller,
	DanetApplication,
	Get,
	KvQueue,
	KvQueueModule,
	Module,
	OnQueueMessage,
} from '../mod.ts';
import {
	assertEquals,
	assertSpyCall,
	assertSpyCalls,
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
	try {
		await application.init(TestModule);
		const listenerInfo = await application.listen(0);
		assertEquals(callback.calls.length, 0);

		let res = await fetch(`http://localhost:${listenerInfo.port}/trigger`);

		assertEquals(res.status, 200);
		assertEquals(await res.text(), 'OK');

		await sleep(500);
		assertSpyCalls(callback, 1);
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
		await application.close();
	} catch (e) {
		await application.close();
		throw e;
	}
});
