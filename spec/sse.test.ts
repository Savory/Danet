import { Controller, Module, SSE } from '../mod.ts';
import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { SSEEvent } from '../src/sse/event.ts';

@Controller()
class SSEExampleController {
	@SSE('sse')
	sendUpdate(): EventTarget {
		const eventTarget = new EventTarget();
		let id = 0;
		const interval = setInterval(() => {
			if (id >= 4) {
				clearInterval(interval);
				const event = new SSEEvent({
					retry: 1000,
					id: `${id}`,
					data: 'close',
					event: 'close',
				});
				eventTarget.dispatchEvent(event);
				return;
			}
			const event = new SSEEvent({
				retry: 1000,
				id: `${id}`,
				data: 'world',
				event: 'hello',
			});
			eventTarget.dispatchEvent(event);
			id++;
		}, 100);
		return eventTarget;
	}
}

@Module({
	controllers: [SSEExampleController],
})
class ExampleModule {}

Deno.test('Body', async () => {
	return new Promise<void>(async (resolve, reject) => {
		const app = new DanetApplication();
		await app.init(ExampleModule);
		const listenEvent = await app.listen(0);
		let eventReceived = 0;
		const eventSource = new EventSource(
			`http://localhost:${listenEvent.port}/sse`,
		);

		eventSource.addEventListener('hello', async (event) => {
			if (event.data === 'world') {
				eventReceived++;
			}
		});

		eventSource.addEventListener('close', async (event) => {
			assertEquals(eventReceived, 4);
			await eventSource.close();
			await app.close();
			resolve();
		});
	});
});
