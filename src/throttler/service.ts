import { Injectable } from '../injector/injectable/decorator.ts';

/**
 * Very small in-memory throttler.
 * Stores timestamps per key and prunes them on each hit.
 */
@Injectable()
export class ThrottlerService {
  private store = new Map<string, number[]>();

  /**
   * Returns current count after adding this request timestamp.
   * Prunes entries older than ttl seconds.
   */
  consume(key: string, ttl: number): number {
    const now = Date.now();
    const windowStart = now - ttl * 1000;
    const list = this.store.get(key) || [];
    const pruned = list.filter((ts) => ts > windowStart);
    pruned.push(now);
    this.store.set(key, pruned);
    return pruned.length;
  }

  /**
   * For tests and diagnostics: reset store
   */
  reset() {
    this.store.clear();
  }
}
