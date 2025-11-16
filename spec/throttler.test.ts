import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';
import { Module } from '../src/module/decorator.ts';
import { Throttle } from '../src/throttler/decorator.ts';
import { ThrottlerService, ThrottleGuard } from '../src/throttler/mod.ts';
import { GLOBAL_GUARD } from '../src/guard/constants.ts';

@Controller('throttle')
class ThrottleController {
  @Throttle(2, 1)
  @Get('/')
  simpleGet() {
    return { ok: true };
  }
}

@Module({
  imports: [],
  controllers: [ThrottleController],
  injectables: [
    ThrottlerService,
    { useClass: ThrottleGuard, token: GLOBAL_GUARD },
  ],
})
class ThrottleModule {}

Deno.test('throttle guard limits requests', async () => {
  const app = new DanetApplication();
  await app.init(ThrottleModule);
  const listenEvent = await app.listen(0);
  const base = `http://localhost:${listenEvent.port}/throttle`;

  const r1 = await fetch(base, { method: 'GET' });
  assertEquals(r1.status, 200);
  await r1?.body?.cancel();

  const r2 = await fetch(base, { method: 'GET' });
  assertEquals(r2.status, 200);
  await r2?.body?.cancel();

  const r3 = await fetch(base, { method: 'GET' });
  assertEquals(r3.status, 429);
  const json = await r3.json();
  assertEquals(json, {
    description: 'Too many requests',
    message: '429 - Too many requests',
    name: 'TooManyRequestsException',
    status: 429,
  });
  await app.close();
});
