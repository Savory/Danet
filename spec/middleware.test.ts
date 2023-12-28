import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { ExecutionContext, HttpContext } from '../src/router/router.ts';
import {
	DanetMiddleware,
	Middleware,
	NextFunction,
} from '../src/router/middleware/decorator.ts';
import { BadRequestException } from '../src/exception/http/exceptions.ts';

@Injectable()
class SimpleInjectable {
	doSomething() {
		return 'I did something';
	}
}

@Injectable()
class SimpleMiddleware implements DanetMiddleware {
	constructor(private simpleInjectable: SimpleInjectable) {
	}

	async action(ctx: ExecutionContext, next: NextFunction) {
		ctx.res.headers.append(
			'middlewaredata',
			this.simpleInjectable.doSomething(),
		);
		await next();
	}
}

@Injectable()
class ThrowingMiddleware implements DanetMiddleware {
	constructor(private simpleInjectable: SimpleInjectable) {
	}

	action(ctx: ExecutionContext) {
		throw new BadRequestException();
	}
}

const secondMiddleware = async (ctx: HttpContext, next: NextFunction) => {
	if (!ctx.res) {
		ctx.res = new Response();
	}
	ctx.res.headers.append('middlewaredata', ' ' + 'more');
	await next();
};

@Controller('simple-controller')
class SimpleController {
	@Get('/')
	@Middleware(SimpleMiddleware)
	getWithMiddleware() {
		return 'toto';
	}

	@Get('/throwing')
	@Middleware(ThrowingMiddleware)
	getWithThrowing() {
	}
}

@Middleware(SimpleMiddleware, secondMiddleware)
@Controller('controller-with-middleware')
class ControllerWithMiddleware {
	@Get('/')
	getWithoutMiddleware() {
	}
}

@Module({
	controllers: [SimpleController, ControllerWithMiddleware],
	injectables: [SimpleInjectable],
})
class MyModule {}

Deno.test('Middleware method decorator', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/simple-controller`,
		{
			method: 'GET',
		},
	);
	const text = res.headers.get('middlewaredata');
	assertEquals(text, `I did something`);
	assertEquals(res.status, 200);
	assertEquals(await res.text(), 'toto');
	await app.close();
});

Deno.test('Throwing middleware method decorator', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/simple-controller/throwing`,
		{
			method: 'GET',
		},
	);
	assertEquals(res.status, 400);
	await res.json();
	await app.close();
});

Deno.test('Middleware controller decorator', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/controller-with-middleware`,
		{
			method: 'GET',
		},
	);
	//order is mixed up on purpose to check that argument order prevails
	const text = res.headers.get('middlewaredata');
	assertEquals(res.status, 200);
	assertEquals(text, `I did something, more`);
	await res.body?.cancel();
	await app.close();
});

@Injectable()
class FirstGlobalMiddleware implements DanetMiddleware {
	async action(ctx: ExecutionContext, next: NextFunction) {
		ctx.res.headers.append('middlewaredata', '[first-middleware]');
		return await next();
	}
}

@Injectable()
class SecondGlobalMiddleware implements DanetMiddleware {
	async action(ctx: ExecutionContext, next: NextFunction) {
		ctx.res.headers.append('middlewaredata', '[second-middleware]');
		return await next();
	}
}

Deno.test('Global middlewares', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	app.addGlobalMiddlewares(FirstGlobalMiddleware, SecondGlobalMiddleware);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/controller-with-middleware`,
		{
			method: 'GET',
		},
	);
	const text = res.headers.get('middlewaredata');
	assertEquals(res.status, 200);
	assertEquals(
		text,
		`[first-middleware], [second-middleware], I did something, more`,
	);
	await res.body?.cancel();
	await app.close();
});
