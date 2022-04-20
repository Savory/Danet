import { crypto } from 'https://deno.land/std@0.135.0/crypto/mod.ts';
import { assert, assertEquals, assertNotEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Controller } from '../controller/decorator.ts';
import { Injectable, SCOPE } from '../injectable/decorator.ts';
import { Constructor } from '../utils/constructor.ts';
import { Injector } from './injector.ts';

function assertInstanceOf<T>(value: T, type: Constructor<T>) {
  assert(value instanceof type, `${value} is not of type ${type.name}`);
}

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


Deno.test('inject one dependency', () => {
  const injector = new Injector();
  const parent = injector.bootstrap(Parent);
  assertInstanceOf(parent.child1, Child1);
})

Deno.test('inject multiple dependencies', () => {
  const injector = new Injector();
  const parent = injector.bootstrap(Parent);
  assertInstanceOf(parent.child1, Child1);
  assertInstanceOf(parent.child2, Child2);
})

Deno.test('inject nested dependencies', () => {
  const injector = new Injector();
  const parent = injector.bootstrap(Parent);
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
  const parent1 = injector.bootstrap(ParentWithSingleton1);
  const parent2 = injector.bootstrap(ParentWithSingleton2);
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
  const parent1 = injector.bootstrap(ParentWithSingleton1);
  const parent2 = injector.bootstrap(ParentWithSingleton2);
  assertNotEquals(parent1.singleton.id, parent2.singleton.id);
});
