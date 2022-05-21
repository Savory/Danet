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
		return `${white(new Date().toUTCString())} ${
			yellow(this.getNamespaceForDisplay())
		} ${colorFunc(text)}`;
	}

	private printToConsole(text: string, colorFunc: (text: string) => string) {
		if (Deno.env.get('NO_LOG'))
			return;
		console.log(this.concatNamespaceAndText(text, colorFunc));
	}

	log(text: string) {
		this.printToConsole(text, green);
	}

	error(text: string) {
		this.printToConsole(text, red);
	}

	warn(text: string) {
		this.printToConsole(text, yellow);
	}
}
