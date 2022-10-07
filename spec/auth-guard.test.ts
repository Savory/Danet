import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';
import { UseGuard } from '../src/guard/decorator.ts';
import { AuthGuard } from '../src/guard/interface.ts';
import { TokenInjector } from '../src/injector/injectable/constructor.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { HttpContext } from '../src/router/router.ts';

@Injectable()
class GlobalGuard implements AuthGuard {
	canActivate(context: HttpContext) {
		context.response.body = {
			passedInglobalGuard: true,
		};
		return true;
	}
}

@Injectable()
class ControllerGuard implements AuthGuard {
	canActivate(context: HttpContext) {
		context.response.body = {
			passedIncontrollerGuard: true,
		};
		return true;
	}
}

@Injectable()
class MethodGuard implements AuthGuard {
	canActivate(context: HttpContext) {
		context.response.body = {
			passedInmethodGuard: true,
		};
		return true;
	}
}

@Controller('method-guard')
class MethodGuardController {
	@UseGuard(MethodGuard)
	@Get('/')
	simpleGet() {}
}

@UseGuard(ControllerGuard)
@Controller('controller-guard')
class AuthGuardController {
	@Get('/')
	simpleGet() {}
}

@Module({
	imports: [],
	controllers: [MethodGuardController],
})
class MethodGuardModule {}

@Module({
	imports: [MethodGuardModule],
	controllers: [AuthGuardController],
})
class ControllerGuardModule {}

for (const guardType of ['controller', 'method']) {
	Deno.test(`${guardType} guard`, async () => {
		const app = new DanetApplication();
		await app.init(ControllerGuardModule);
		const listenEvent = await app.listen(0);
		const res = await fetch(
			`http://localhost:${listenEvent.port}/${guardType}-guard`,
			{
				method: 'GET',
			},
		);
		const json = await res.json();
		assertEquals(json, {
			[`passedIn${guardType}Guard`]: true,
		});
		await app.close();
	});
}

@Controller('global-guard')
class GlobalAuthController {
	@Get('/')
	simpleGet() {}
}

@Module({
	imports: [],
	controllers: [GlobalAuthController],
	injectables: [new TokenInjector(GlobalGuard, GLOBAL_GUARD)],
})
class GlobalAuthModule {}

Deno.test('Global guard', async () => {
	const app = new DanetApplication();
	await app.init(GlobalAuthModule);
	const listenEvent = await app.listen(0);
	const res = await fetch(`http://localhost:${listenEvent.port}/global-guard`, {
		method: 'GET',
	});
	const json = await res.json();
	assertEquals(json, {
		[`passedInglobalGuard`]: true,
	});
	await app.close();
});

@Injectable()
class ThrowingGuard implements AuthGuard {
	canActivate() {
		return false;
	}
}

@UseGuard(ThrowingGuard)
@Controller('throwing-guard')
class ThrowingGuardController {
	@Get('/')
	simpleGet() {}
}

@Module({
	imports: [],
	controllers: [ThrowingGuardController],
})
class ThrowingAuthModule {}

Deno.test('403 when guard is throwing', async () => {
	const app = new DanetApplication();
	await app.init(ThrowingAuthModule);
	const listenEvent = await app.listen(0);
	const res = await fetch(
		`http://localhost:${listenEvent.port}/throwing-guard`,
		{
			method: 'GET',
		},
	);
	const errorStatus = res.status;
	assertEquals(errorStatus, 403);
	const json = await res.json();
	assertEquals(json, {
		message: '403 - Forbidden',
		name: 'ForbiddenException',
		status: 403,
	});
	await app.close();
});
