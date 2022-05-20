import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import {
	Controller,
	Delete,
	Get,
	Post,
	Put,
} from '../src/router/controller/decorator.ts';

@Controller('nice-controller')
class SimpleController {
	@Get('/')
	simpleGet() {
		return 'OK GET';
	}

	@Post('/')
	simplePost() {
		return 'OK POST';
	}

	@Put('/')
	simplePut() {
		return 'OK PUT';
	}

	@Delete('/')
	simpleDelete() {
		return 'OK DELETE';
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

const app = new DanetApplication();
await app.init(MyModule);


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
