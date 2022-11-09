import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Catch, UseFilter } from '../src/exception/filter/decorator.ts';
import { ExceptionFilter } from '../src/exception/filter/interface.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { HttpContext } from '../src/router/router.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';

@Injectable()
class SimpleService {
	private a = 0;
	doSomething() {
		this.a++;
	}
}

class CustomException extends Error {
	public customField = 'i am a custom field';
	constructor(text: string) {
		super(text);
	}
}

@Injectable()
class ErrorFilter implements ExceptionFilter {
	constructor(private simpleService: SimpleService) {
	}

	catch(exception: any, context: HttpContext) {
		this.simpleService.doSomething();
		context.response.body = {
			wePassedInFilterCatchingAllErrors: true,
		};
	}
}

@Injectable()
@Catch(CustomException)
class CustomErrorFilter implements ExceptionFilter {
	constructor(private simpleService: SimpleService) {
	}

	catch(exception: any, context: HttpContext) {
		this.simpleService.doSomething();
		context.response.body = {
			wePassedInFilterCatchingOnlySomeError: true,
		};
	}
}

@UseFilter(ErrorFilter)
@Controller('')
class ControllerWithFilter {
	@Get('/')
	simpleGet() {
		throw Error('an error');
	}
}

@Controller('custom-error')
class ControllerWithCustomFilter {
	@UseFilter(CustomErrorFilter)
	@Get('')
	customError() {
		throw new CustomException('an error');
	}

	@Get('unexpected-error')
	unexpectedError() {
		throw Error('unexpected');
	}
}
@Module({
	controllers: [ControllerWithFilter, ControllerWithCustomFilter],
	injectables: [SimpleService],
})
class ModuleWithFilter {}

for (
	const testName of [
		'Exception Filter with @Catch catch related errors',
		'Method exception filter works',
	]
) {
	Deno.test(testName, async () => {
		const app = new DanetApplication();
		await app.init(ModuleWithFilter);
		const listenEvent = await app.listen(0);

		const res = await fetch(
			`http://localhost:${listenEvent.port}/custom-error`,
			{
				method: 'GET',
			},
		);
		const json = await res.json();
		assertEquals(json, {
			wePassedInFilterCatchingOnlySomeError: true,
		});
		await app.close();
	});
}

Deno.test('Controller filter works', async () => {
	const app = new DanetApplication();
	await app.init(ModuleWithFilter);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}`, {
		method: 'GET',
	});
	const json = await res.json();
	assertEquals(json, {
		wePassedInFilterCatchingAllErrors: true,
	});
	await app.close();
});

Deno.test('throw 500 on unexpected error', async () => {
	const app = new DanetApplication();
	await app.init(ModuleWithFilter);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/custom-error/unexpected-error`,
		{
			method: 'GET',
		},
	);
	assertEquals(500, res.status);
	await res.json();
	await app.close();
});
