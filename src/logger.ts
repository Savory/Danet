import {
	green,
	red,
	white,
	yellow,
} from 'https://deno.land/std@0.135.0/fmt/colors.ts';
import { Injectable } from './injector/injectable/decorator.ts';

@Injectable()
export class Logger {
	constructor(private namespace?: string) {
	}

	private setNamespace(namespace: string) {
		this.namespace = namespace;
	}

	private getNamespaceForDisplay() {
		if (this.namespace) {
			return `[${this.namespace}] `;
		}
		return '';
	}

	private concatNamespaceAndText(
		text: string,
		colorFunc: (text: string) => string,
	) {
		const date = new Date().toUTCString();
		const context = this.getNamespaceForDisplay();

		return `${white(date)} ${yellow(context)} ${colorFunc(text)}`;
	}

	private printTo(text: string, colorFunc: (text: string) => string, loggingFunc: (text: string) => any) {
		if (Deno.env.get('NO_LOG')) {
			return;
		}
		loggingFunc(this.concatNamespaceAndText(text, colorFunc));
	}

	log(text: string) {
		this.printTo(text, green, console.log);
	}

	error(text: string) {
		this.printTo(text, red, console.error);
	}

	warn(text: string) {
		this.printTo(text, yellow, console.warn);
	}
}
