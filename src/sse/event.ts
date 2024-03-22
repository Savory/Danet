import { SSEMessage } from "./message.ts"

export class SSEEvent extends CustomEvent<SSEMessage> {
    constructor(message: SSEMessage) {
        super('message', { detail: message });
    }
}