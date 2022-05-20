import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { app } from './app.ts';

Deno.test('HTTP Methods', async (ctx) => {
	const nonBlockingListen = new Promise(async (resolve) => {
		await app.listen(3000);
		resolve(true);
	});

	for (let method of ['GET', 'POST', 'PUT']) {
			const res = await fetch('http://localhost:3000/nice-controller', {
				method: method,
			});
			const text = await res.text();
			assertEquals(text, `OK ${method}`);
	}
	await app.close();
	await nonBlockingListen;
});
