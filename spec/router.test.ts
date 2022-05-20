// deno-lint-ignore-file no-explicit-any

import {
	assertEquals,
	assertNotEquals,
} from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Request, Response } from 'https://deno.land/x/oak@v9.0.1/mod.ts';
import { Catch, UseFilter } from '../src/exception/filter/decorator.ts';
import { ExceptionFilter } from '../src/exception/filter/interface.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';
import { UseGuard } from '../src/guard/decorator.ts';
import { AuthGuard } from '../src/guard/interface.ts';
import { TokenInjector } from '../src/injector/injectable/constructor.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { Injector } from '../src/injector/injector.ts';
import { Controller, Get, Post } from '../src/router/controller/decorator.ts';
import {
	Body,
	Param,
	Query,
	Req,
	Res,
} from '../src/router/controller/params/decorators.ts';
import { DanetRouter, HttpContext } from '../src/router/router.ts';

Deno.test('router.handleRoute inject params into method', async (testContext) => {
	class CustomException extends Error {
		public customField = 'i am a custom field';
		constructor(text: string) {
			super(text);
		}
	}

	@Injectable()
	class GlobalGuard implements AuthGuard {
		canActivate(context: HttpContext) {
			context.state.globalguardAssignedVariable = 'coucou';
			return true;
		}
	}

	@Injectable()
	class ControllerGuard implements AuthGuard {
		canActivate(context: HttpContext) {
			context.state.user = 'coucou';
			return true;
		}
	}

	@Injectable()
	class MethodGuard implements AuthGuard {
		canActivate(context: HttpContext) {
			context.state.something = 'coucou';
			return true;
		}
	}

	@Injectable()
	class ThrowingGuard implements AuthGuard {
		canActivate(context: HttpContext) {
			return false;
		}
	}

	class ErrorFilter implements ExceptionFilter {
		catch(exception: any, context: HttpContext) {
			context.response.body = {
				wePassedInFilterCatchingAllErrors: true,
			};
		}
	}

	@Catch(CustomException)
	class CustomErrorFilter implements ExceptionFilter {
		catch(exception: any, context: HttpContext) {
			context.response.body = {
				wePassedInFilterCatchingOnlySomeError: true,
			};
		}
	}

	@UseFilter(ErrorFilter)
	@Controller('my-second-path')
	class ControllerWithFilter {
		@Get('/')
		simpleGet(@Res() res: Response, @Query('myvalue') myvalue: string) {
			throw Error('an error');
		}
	}

	@UseGuard(ControllerGuard)
	@Controller('my-path')
	class MyController {
		@Get('/')
		testResFunction(@Res() res: Response, @Query('myvalue') myvalue: string) {
			res.body = {
				myvalue,
			};
		}

		@Post('')
		testReqFunction(@Req() req: Request) {
			return req.body;
		}

		@Post('')
		testBodyFunction(@Body('whatisit') niceValue: string) {
			return niceValue;
		}

		@Post('')
		testBodyWithoutParamFunction(@Body() fullBody: string) {
			return fullBody;
		}

		@UseGuard(MethodGuard)
		@Post('/:id')
		testQueryParam(@Param('id') id: string) {
			return id;
		}

		@UseGuard(ThrowingGuard)
		@Post('/:id')
		throwingAuthGuardRoute(@Param('id') id: string) {
			return id;
		}

		@Post('/:id')
		throwingRoute() {
			throw Error('anerror');
		}

		@Post('/use-filter')
		@UseFilter(ErrorFilter)
		useFilterRoute() {
			throw Error('something');
		}

		@Post('/use-filter')
		@UseFilter(CustomErrorFilter)
		useFilterWithCatchRouteButWrongError() {
			throw new Error('something');
		}

		@Post('/use-filter')
		@UseFilter(CustomErrorFilter)
		useFilterWithCatchRoute() {
			throw new CustomException('something');
		}
	}
	const injector = new Injector();
	injector.registerInjectables([new TokenInjector(GlobalGuard, GLOBAL_GUARD)]);
	injector.resolveControllers([MyController, ControllerWithFilter]);
	const injectorWithoutGlobalGuard = new Injector();
	injectorWithoutGlobalGuard.resolveControllers([
		MyController,
		ControllerWithFilter,
	]);
	const routerWithoutGlobalGuard = new DanetRouter(injectorWithoutGlobalGuard);
	const router = new DanetRouter(injector);
	const searchParams = new Map();
	searchParams.set('id', 3);
	searchParams.set('myvalue', 'a nice value');
	const context = {
		response: { body: '', status: 200 },
		state: { user: '', something: '', globalguardAssignedVariable: '' },
		request: { url: { searchParams }, body: { whatisit: 'testbody' } },
	};

	await testContext.step('@Req decorator works', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.testReqFunction,
		)(context as any);
		assertEquals(context.response.body, { whatisit: 'testbody' });
	});

	await testContext.step('@Body with param decorator works', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.testBodyFunction,
		)(context as any);
		assertEquals(context.response.body, 'testbody');
	});

	await testContext.step('@Body WITHOUT param decorator works', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.testBodyWithoutParamFunction,
		)(context as any);
		assertEquals(context.response.body, { whatisit: 'testbody' });
	});

	await testContext.step('@Param decorator works', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.testQueryParam,
		)(context as any);
		assertEquals(context.response.body, 3);
	});

	await testContext.step(
		'@UseAuthGuard controller decorator works',
		async () => {
			await router.handleRoute(
				MyController,
				MyController.prototype.testQueryParam,
			)(context as any);
			assertEquals(context.state.user, 'coucou');
		},
	);

	await testContext.step(
		'Exception Filter with @Catch do not catch unrelated errors',
		async () => {
			await router.handleRoute(
				MyController,
				MyController.prototype.useFilterWithCatchRouteButWrongError,
			)(context as any);
			assertNotEquals(context.response.body, {
				wePassedInFilterCatchingOnlySomeError: true,
			});
		},
	);

	await testContext.step(
		'Exception Filter with @Catch catch related errors',
		async () => {
			await router.handleRoute(
				MyController,
				MyController.prototype.useFilterWithCatchRoute,
			)(context as any);
			assertEquals(context.response.body, {
				wePassedInFilterCatchingOnlySomeError: true,
			});
		},
	);

	await testContext.step('@UseFilter method decorator works', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.useFilterRoute,
		)(context as any);
		assertEquals(context.response.body, {
			wePassedInFilterCatchingAllErrors: true,
		});
	});

	await testContext.step('@UseFilter controller decorator works', async () => {
		await router.handleRoute(
			ControllerWithFilter,
			ControllerWithFilter.prototype.simpleGet,
		)(context as any);
		assertEquals(context.response.body, {
			wePassedInFilterCatchingAllErrors: true,
		});
	});

	await testContext.step(
		'@UseAuthGuard method\'s decorator works',
		async () => {
			await router.handleRoute(
				MyController,
				MyController.prototype.testQueryParam,
			)(context as any);
			assertEquals(context.state.something, 'coucou');
		},
	);

	await testContext.step('throw 403 when AuthGuard returns false', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.throwingAuthGuardRoute,
		)(context as any);
		console.log(context.response);
		assertEquals(context.response.status, 403);
		assertEquals(context.response.body, {
			message: 'Forbidden',
			status: 403,
		});
	});

	await testContext.step('Execute global guard', async () => {
		await router.handleRoute(
			MyController,
			MyController.prototype.testQueryParam,
		)(context as any);
		assertEquals(context.state.globalguardAssignedVariable, 'coucou');
	});

	await testContext.step('Work when there is no global guard', async () => {
		await routerWithoutGlobalGuard.handleRoute(
			MyController,
			MyController.prototype.testQueryParam,
		)(context as any);
	});

	await testContext.step(
		'answer 500 when there is an unexpected error',
		async () => {
			await router.handleRoute(
				MyController,
				MyController.prototype.throwingRoute,
			)(context as any);
			assertEquals(context.response.status, 500);
		},
	);

	await testContext.step(
		'answer 500 when there is an unexpected error',
		async () => {
			await router.handleRoute(
				MyController,
				MyController.prototype.throwingRoute,
			)(context as any);
			assertEquals(context.response.status, 500);
		},
	);
});
