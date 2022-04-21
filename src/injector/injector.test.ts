import { crypto } from 'https://deno.land/std@0.135.0/crypto/mod.ts';
import {
  assert,
  assertEquals,
  assertInstanceOf,
  assertNotEquals, assertThrows
} from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Controller } from '../controller/decorator.ts';
import { Injectable, SCOPE } from '../injectable/decorator.ts';
import { Injector } from './injector.ts';

@Injectable({ scope: SCOPE.REQUEST })
class Child2 {

}

@Injectable({ scope: SCOPE.REQUEST })
class Child1 {
  constructor(public child: Child2) {
  }
}

@Controller()
class Parent {
  constructor(public child1: Child1, public child2: Child2) {
  }
}

Deno.test('inject dependencies', () => {
  const injector = new Injector();
  injector.registerInjectables([Child1, Child2]);
  injector.resolveControllers([Parent]);
  const parent = injector.get(Parent);
  assertInstanceOf(parent.child1, Child1);
  assertInstanceOf(parent.child2, Child2);
})

Deno.test('inject nested dependencies', () => {
  const injector = new Injector();
  injector.registerInjectables([Child1, Child2]);
  injector.resolveControllers([Parent]);
  const parent = injector.get(Parent);
  assertInstanceOf(parent.child1.child, Child2);
})

Deno.test('inject singleton properly', () => {
  @Injectable({scope: SCOPE.GLOBAL})
  class Singleton {
    constructor(public id: string) {
      this.id = crypto.randomUUID();
    }
  }
  @Controller('')
  class ParentWithSingleton1 {
    constructor(public singleton: Singleton) {
    }
  }

  @Controller()
  class ParentWithSingleton2 {
    constructor(public singleton: Singleton) {
    }
  }
  const injector = new Injector();
  injector.registerInjectables([Singleton]);
  injector.resolveControllers([ParentWithSingleton1, ParentWithSingleton2]);
  const parent1 = injector.get(ParentWithSingleton1);
  const parent2 = injector.get(ParentWithSingleton2);
  assertEquals(parent1.singleton.id, parent2.singleton.id);
});

Deno.test('inject non singleton properly', () => {
  @Injectable({ scope: SCOPE.REQUEST })
  class NotSingleton {
    constructor(public id: string) {
      this.id = crypto.randomUUID();
    }
  }
  @Controller()
  class ParentWithSingleton1 {
    constructor(public singleton: NotSingleton) {
    }
  }

  @Controller()
  class ParentWithSingleton2 {
    constructor(public singleton: NotSingleton) {
    }
  }

  const injector = new Injector();
  injector.registerInjectables([NotSingleton]);
  injector.resolveControllers([ParentWithSingleton1, ParentWithSingleton2]);
  const parent1 = injector.get(ParentWithSingleton1);
  const parent2 = injector.get(ParentWithSingleton2);
  assertNotEquals(parent1.singleton.id, parent2.singleton.id);
});
