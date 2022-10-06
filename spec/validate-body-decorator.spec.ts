import {
	assertEquals,
	assertExists,
} from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { DanetApplication } from '../src/mod.ts';
import { Injectable } from '../src/injector/injectable/mod.ts';
import { Module } from '../src/module/mod.ts';
import { Body, Controller, Get, Post } from '../src/router/controller/mod.ts';

import { IsNumber, IsString } from 'https://deno.land/x/validatte/mod.ts';

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

	@Post('/body-with-prop')
	sayHelloToHim2(@Body('name') body: DTO) {
		return jsonWithMessage(`Hello ${body}`);
	}

	@Post('/multiples-bodys-parameters')
	sayHelloToThem(@Body('name') body1: DTO, @Body() body2: DTO) {
		return jsonWithMessage(
			`Hello ${body1} and ${body2.name}, wait... it's the same people`,
		);
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

Deno.test('Test', async (t) => {
	const app = new DanetApplication();
	await app.init(App);
	const port = (await app.listen(0)).port;
	let res, json;

	// ------------------------------------------------------------------
	// STEP 1 => Return normal if body is equals DTO and 400 if it is not
	// ------------------------------------------------------------------

	// RIGHT
	res = await fetchWithBody(`http://localhost:${port}/test`, {
		name: 'James',
		age: 25, // A string as number
	});
	assertEquals(res.status, 200);
	assertEquals(await res.json(), jsonWithMessage('Hello James'));

	// WRONG
	res = await fetchWithBody(`http://localhost:${port}/test`, {
		name: 'James',
		age: 'Potter', // A string as number
	});
	assertEquals(res.status, 400);

	json = await res.json();
	assertExists(json);
	assertExists(json.reasons);

	// -----------------------------------------------------------
	// STEP 2 => Same as last one, but passing a prop in @Body(..)
	// -----------------------------------------------------------

	// WRONG
	res = await fetchWithBody(`http://localhost:${port}/test/body-with-prop`, {
		name: 'James',
		age: 'Potter', // A string as number
	});
	assertEquals(res.status, 400);
	json = await res.json();
	assertExists(json);
	assertExists(json.reasons);

	// -----------------------------------------------------------------------
	// STEP 3 => Multiples @Body, one extract a prop, and other the whole body
	// -----------------------------------------------------------------------

	// WRONG
	res = await fetchWithBody(
		`http://localhost:${port}/test/multiples-bodys-parameters`,
		{
			name: 'James',
			age: 'Potter', // A string as number
		},
	);
	assertEquals(res.status, 400);
	json = await res.json();
	assertExists(json);
	assertExists(json.reasons);

	// RIGHT
	res = await fetchWithBody(
		`http://localhost:${port}/test/multiples-bodys-parameters`,
		{
			name: 'James',
			age: 25,
		},
	);
	assertEquals(res.status, 200);
	json = await res.json();
	assertEquals(
		json,
		jsonWithMessage('Hello James and James, wait... it\'s the same people'),
	);

	await app.close();
});
