import { OnAppClose } from '../hook/interfaces.ts';
import { ThrottlerStorage, ThrottlerStorageRecord } from './interface.ts';

/**
 * Default in-memory `ThrottlerStorage`. Counts are kept in a `Map` and each
 * window schedules its own eviction timer so expired entries are removed
 * instead of leaking forever.
 *
 * This storage is process-local: in a multi-instance deployment provide a
 * shared implementation (e.g. backed by Redis or Deno KV) to
 * `ThrottlerModule.forRoot()` instead.
 */
export class InMemoryThrottlerStorage implements ThrottlerStorage, OnAppClose {
	private readonly records = new Map<
		string,
		{ totalHits: number; expiresAt: number; timeoutId: number }
	>();

	/**
	 * The number of windows currently tracked. Exposed mainly so the eviction
	 * of expired windows can be observed.
	 */
	get size(): number {
		return this.records.size;
	}

	increment(key: string, ttl: number): ThrottlerStorageRecord {
		const now = Date.now();
		const existing = this.records.get(key);

		if (existing && existing.expiresAt > now) {
			existing.totalHits++;
			return {
				totalHits: existing.totalHits,
				timeToExpire: existing.expiresAt - now,
			};
		}

		// New window, or the previous one already expired: start fresh and
		// schedule the eviction of this key once its window elapses.
		if (existing) {
			clearTimeout(existing.timeoutId);
		}
		const timeoutId = setTimeout(() => this.records.delete(key), ttl);
		// Cleanup is a background concern — it must not keep the process alive.
		Deno.unrefTimer(timeoutId);
		this.records.set(key, { totalHits: 1, expiresAt: now + ttl, timeoutId });
		return { totalHits: 1, timeToExpire: ttl };
	}

	/**
	 * Clears every pending eviction timer when the application shuts down, so no
	 * timers are left dangling.
	 */
	onAppClose(): void {
		for (const { timeoutId } of this.records.values()) {
			clearTimeout(timeoutId);
		}
		this.records.clear();
	}
}
