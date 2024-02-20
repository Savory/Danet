import { OnAppClose } from '../hook/mod.ts';
import { Injectable } from '../mod.ts';
import { QueueEvent } from './constants.ts';

// deno-lint-ignore no-explicit-any
type Listener<P = any> = (payload: P) => void;

@Injectable()
export class KvQueue implements OnAppClose {
	private kv!: Deno.Kv;
	private listenersMap: Map<string, Listener> = new Map();

	public async start(name?: string) {
		this.kv = await Deno.openKv(name);
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

	public async onAppClose(): Promise<void> {
		await this.kv.close();
	}
}
