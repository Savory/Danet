import { assertEquals, assertObjectMatch } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';
import { UseGuard } from '../src/guard/decorator.ts';
import { AuthGuard } from '../src/guard/interface.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { ExecutionContext, HttpContext } from '../src/router/router.ts';
import { SetMetadata } from '../src/metadata/decorator.ts';
import { MetadataHelper } from '../src/metadata/helper.ts';

@Injectable()
class SimpleService {
	private a = 0;
	doSomething() {
		this.a++;
	}
}

@Injectable()
class GlobalGuard implements AuthGuard {
	constructor(private simpleService: SimpleService) {
	}

	canActivate(context: ExecutionContext) {
		this.simpleService.doSomething();
		if (!context.res) {
			context.res = new Response();
		}
		context.res.headers.append('passedInglobalGuard', 'true');
		return true;
	}
}

@Injectable()
class ControllerGuard implements AuthGuard {
	constructor(private simpleService: SimpleService) {
	}

	canActivate(context: ExecutionContext) {
		const controller = context.getClass();
		const customMetadata = MetadataHelper.getMetadata<string>(
			'customMetadata',
			controller,
		);
		this.simpleService.doSomething();
		if (!context.res) {
			context.res = new Response();
		}
		context.res.headers.append('passedIncontrollerGuard', 'true');
		context.res.headers.append('customMetadata', customMetadata);
		return true;
	}
}

@Injectable()
class MethodGuard implements AuthGuard {
	constructor(private simpleService: SimpleService) {
	}

	canActivate(context: ExecutionContext) {
		this.simpleService.doSomething();
		const method = context.getHandler();
		const customMetadata = MetadataHelper.getMetadata<string>(
			'customMetadata',
			method,
		);
		if (!context.res) {
			context.res = new Response();
		}
		context.res.headers.append('passedInmethodGuard', 'true');
		context.res.headers.append('customMetadata', customMetadata);
		return true;
	}
}

@Controller('method-guard')
class MethodGuardController {
	@SetMetadata('customMetadata', 'customValue')
	@UseGuard(MethodGuard)
	@Get('/')
	simpleGet() {}
}

@SetMetadata('customMetadata', 'customValue')
@UseGuard(ControllerGuard)
@Controller('controller-guard')
class AuthGuardController {
	@Get('/')
	simpleGet() {}
}

@Module({
	imports: [],
	controllers: [MethodGuardController],
	injectables: [SimpleService],
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
		assertEquals(res.status, 200);
		assertEquals(res.headers.get(`passedIn${guardType}guard`), 'true');
		assertEquals(res.headers.get('custommetadata'), 'customValue');
		await res?.body?.cancel();
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
	injectables: [{ useClass: GlobalGuard, token: GLOBAL_GUARD }, SimpleService],
})
class GlobalAuthModule {}

Deno.test('Global guard', async () => {
	const app = new DanetApplication();
	await app.init(GlobalAuthModule);
	const listenEvent = await app.listen(0);
	const res = await fetch(`http://localhost:${listenEvent.port}/global-guard`, {
		method: 'GET',
	});
	assertEquals(res.headers.get('passedinglobalguard'), 'true');
	await res?.body?.cancel();
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
	injectables: [SimpleService],
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
