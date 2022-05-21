import {
	green,
	red,
	white,
	yellow,
} from 'https://deno.land/std@0.135.0/fmt/colors.ts';
import na from 'https://deno.land/x/deno_libphonenumber@v1.9.20/index.js';
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

	log(text: string) {
		console.log(this.concatNamespaceAndText(text, green));
	}

	error(text: string) {
		console.log(this.concatNamespaceAndText(text, red));
	}

	warn(text: string) {
		console.log(this.concatNamespaceAndText(text, yellow));
	}
}
