import {
	assertEquals,
	assertExists,
} from 'https://deno.land/std@0.220.1/testing/asserts.ts';
import { DanetApplication } from '../src/mod.ts';
import { Module } from '../src/module/mod.ts';
import { Body, Controller, Get, Post } from '../src/router/controller/mod.ts';
import { IsNumber, IsString, LengthGreater } from '../validation.ts';

// Utils ---------------
function jsonWithMessage(msg: string) {
	return ({ message: msg });
}
async function fetchWithBody(url: string, body: any) {
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}
// ---------------------

class DTO {
	@IsString()
	@LengthGreater(20)
	name!: string;

	@IsNumber()
	age!: number;
}

@Controller('/test')
class AppController {
	constructor() {}

	@Get('')
	justSayHello() {
		return jsonWithMessage('Hello');
	}

	@Post('')
	sayHelloToHim1(@Body() body: DTO) {
		return jsonWithMessage(`Hello ${body.name}`);
	}

	@Post('partial-body')
	sayHelloToName(@Body('name') name: string) {
		return jsonWithMessage(`Hello ${name}`);
	}

	@Post('validate-only-prop')
	sayHelloToPerson(@Body('person') person: DTO) {
		return jsonWithMessage(`Hello ${person.name}`);
	}
}

@Module({
	controllers: [AppController],
})
class App {}

Deno.test('Controller works', async () => {
	const app = new DanetApplication();
	await app.init(App);
	const port = (await app.listen(0)).port;

	const res = await fetch(`http://localhost:${port}/test`, {
		method: 'GET',
	});
	const json = await res.json();
	assertEquals(json, jsonWithMessage('Hello'));
	await app.close();
});

Deno.test('Return 200 if body follows DTO', async (t) => {
	const app = new DanetApplication();
	await app.init(App);
	const port = (await app.listen(0)).port;
	let res, json;

	res = await fetchWithBody(`http://localhost:${port}/test`, {
		name: 'James  Very Long Name wow Awesome',
		age: 23, // A string as number
	});
	assertEquals(res.status, 200);
	await res.body?.cancel();

	await app.close();
});

Deno.test('Return 200 when using partial body decorator', async (t) => {
	const app = new DanetApplication();
	await app.init(App);
	const port = (await app.listen(0)).port;
	let res, json;

	res = await fetchWithBody(`http://localhost:${port}/test/partial-body`, {
		name: 'James',
		age: 23, // A string as number
	});
	assertEquals(res.status, 200);
	await res.body?.cancel();

	await app.close();
});

Deno.test('Return 200 when prop is a class with validators and valid', async (t) => {
	const app = new DanetApplication();
	await app.init(App);
	const port = (await app.listen(0)).port;
	let res, json;

	res = await fetchWithBody(
		`http://localhost:${port}/test/validate-only-prop`,
		{
			person: {
				name: 'James Has A Bery Long Name Be Ready',
				age: 23, // A string as number
			},
		},
	);
	assertEquals(res.status, 200);
	await res.body?.cancel();

	await app.close();
});

Deno.test('Return 400 if body is NOT following DTO', async (t) => {
	const app = new DanetApplication();
	await app.init(App);
	const port = (await app.listen(0)).port;
	let res, json;

	res = await fetchWithBody(`http://localhost:${port}/test`, {
		name: 'James',
		age: 23,
	});
	assertEquals(res.status, 400);

	// Json exist
	json = await res.json();
	assertExists(json);
	assertExists(json.reasons);

	res = await fetchWithBody(`http://localhost:${port}/test`, {
		name: 'James',
		age: '23', // A string as number
	});
	assertEquals(res.status, 400);

	// Json exist
	json = await res.json();
	assertExists(json);
	assertExists(json.reasons);

	await app.close();
});
