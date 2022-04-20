import { Constructor } from '../utils/constructor.ts';

export function Module<T>() {
  return (_: Constructor<T>): void => {};
}
