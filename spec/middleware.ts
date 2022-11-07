import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { HttpContext } from '../src/router/router.ts';
import {
	DanetMiddleware,
	Middleware,
} from '../src/router/middleware/decorator.ts';
import {
	BadRequestException,
	NotFoundException,
} from '../src/exception/http/exceptions.ts';

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

	action(ctx: HttpContext) {
		ctx.response.body = `${ctx.response.body as string || ''}` +
			this.simpleInjectable.doSomething();
	}
}

@Injectable()
class ThrowingMiddleware implements DanetMiddleware {
	constructor(private simpleInjectable: SimpleInjectable) {
	}

	action(ctx: HttpContext) {
		throw new NotFoundException();
	}
}

const secondMiddleware = (ctx: HttpContext) => {
	ctx.response.body = `${ctx.response.body as string || ''}` + ' ' + 'more';
};

@Controller('simple-controller')
class SimpleController {
	@Get('/')
	@Middleware(SimpleMiddleware)
	getWithMiddleware() {
	}

	@Get('/throwing')
	@Middleware(ThrowingMiddleware)
	getWithThrowing() {
	}
}

@Middleware(secondMiddleware, SimpleMiddleware)
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

const app = new DanetApplication();
Deno.test('Middleware method decorator', async () => {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/simple-controller`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, `I did something`);
	await app.close();
});

Deno.test('Throwing middleware method decorator', async () => {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/simple-controller/throwing`,
		{
			method: 'GET',
		},
	);
	assertEquals(404, res.status);
	await res.json();
	await app.close();
});

Deno.test('Middleware controller decorator', async () => {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/controller-with-middleware`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	//order is mixed up on purpose to check that argument order prevails
	assertEquals(text, ` moreI did something`);
	await app.close();
});

@Injectable()
class FirstGlobalMiddleware implements DanetMiddleware {
	action(ctx: HttpContext): any {
		ctx.response.body = `${
			ctx.response.body as string || ''
		}[first-middleware]`;
	}
}

@Injectable()
class SecondGlobalMiddleware implements DanetMiddleware {
	action(ctx: HttpContext): any {
		ctx.response.body = `${
			ctx.response.body as string || ''
		}[second-middleware]`;
	}
}

Deno.test('Global middlewares', async () => {
	await app.init(MyModule);
	app.addGlobalMiddlewares(FirstGlobalMiddleware, SecondGlobalMiddleware);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/controller-with-middleware`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(
		text,
		`[first-middleware][second-middleware] moreI did something`,
	);
	await app.close();
});
