import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { app } from './app.ts';

Deno.test('HTTP Methods', async (ctx) => {
	const running = new Promise(async (resolve) => {
		const list = app.listen(3000);
		await list;
		resolve(true);
	});

	const res = await fetch('http://localhost:3000/nice-controller', {
		method: 'GET',
	});
	assertEquals(await res.text(), 'OK GET');

	await app.close();
	await running;
});
