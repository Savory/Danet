import { MetadataHelper } from '../metadata/mod.ts';
import { Logger, Module, ModuleConstructor } from '../mod.ts';
import { eventListenerMetadataKey } from './mod.ts';

type Listener<P> = (payload: P) => void;

// deno-lint-ignore no-explicit-any
export class EventEmitter<T = any> {
  private logger: Logger = new Logger('EventEmitter');
  private channelsMap: Map<string, BroadcastChannel>;

  constructor() {
    this.channelsMap = new Map<string, BroadcastChannel>();
  }

  emmit(channelName: string, payload: T) {
    const listeners = this.getListeners(channelName);
    const bc = this.lazyCreateBroadcastChannel(channelName, listeners);
    bc.postMessage(JSON.stringify(payload));
  }

  private getListeners(channelName: string) {
    const listeners = MetadataHelper.getMetadata<Listener<T>[]>(
      eventListenerMetadataKey,
      channelName,
    );
    if (!listeners?.length) {
      this.logger.warn(`No listener subscribed for channel '${channelName}'`);
    }

    return listeners;
  }

  private lazyCreateBroadcastChannel(
    channelName: string,
    listeners: Listener<T>[],
  ): BroadcastChannel {
    let bc = this.channelsMap.get(channelName);

    if (!bc) {
      bc = new BroadcastChannel(channelName);
      this.channelsMap.set(channelName, bc);

      bc.onmessage = ({ data }) => {
        // parse data
        const payload = JSON.stringify(data) as T;
        // call all listeners
        listeners.map((listener) => {
          listener(payload);
        });
      };
    }

    return bc;
  }

  static forRoot(): ModuleConstructor {
    const moduleDecorator = Module({
      injectables: [EventEmitter],
    });
    class Events {}

    moduleDecorator(Events);
    return Events;
  }
}
