import { OnAppBootstrap, OnAppClose } from '../hook/mod.ts';
import { Inject } from '../mod.ts';
import { Injectable } from '../mod.ts';
import { KV_QUEUE_NAME, QueueEvent } from './constants.ts';

// deno-lint-ignore no-explicit-any
type Listener<P = any> = (payload: P) => void;

@Injectable()
export class KvQueue implements OnAppClose, OnAppBootstrap {
	private kv!: Deno.Kv;
	private listenersMap: Map<string, Listener> = new Map();

	constructor(@Inject(KV_QUEUE_NAME) private name: string) {
	}

	public async onAppClose(): Promise<void> {
		await this.kv.close();
	}

	public async onAppBootstrap(): Promise<void> {
		this.kv = await Deno.openKv(this.name);
	}

	public sendMessage(type: string, data: unknown) {
		return this.kv.enqueue({ type, data });
	}

	public addListener(type: string, callback: Listener) {
		this.listenersMap.set(type, callback);
	}

	public attachListeners() {
		this.kv.listenQueue((msg: QueueEvent) => {
			const type = msg.type;
			const callback = this.listenersMap.get(type);
			if (callback) {
				return callback(msg.data);
			}
			throw Error('Unhandled message type');
		});
	}
}
