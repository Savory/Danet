/**
 * @module
 * Logger module.
 * Provides a class to log messages to the console.
 */

import { green, red, white, yellow } from './deps.ts';
import { Injectable } from './injector/injectable/decorator.ts';

/**
 * A Logger class to handle logging with optional namespace and color-coded output.
 *
 * @remarks
 * This class provides methods to log messages with different severity levels (log, error, warn).
 * It supports optional namespaces for better context in logs and uses color functions to
 * differentiate log types.
 *
 * @example
 * ```typescript
 * const logger = new Logger('MyNamespace');
 * logger.log('This is an info message');
 * logger.error('This is an error message');
 * logger.warn('This is a warning message');
 * ```
 */
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

	private printTo(
		text: string,
		colorFunc: (text: string) => string,
		loggingFunc: (text: string) => void,
	) {
		if (Deno.env.get('NO_LOG')) {
			return;
		}
		loggingFunc(this.concatNamespaceAndText(text, colorFunc));
	}

	/**
	 * Logs a message to the console with green color.
	 *
	 * @param text - The message to be logged.
	 */
	log(text: string) {
		this.printTo(text, green, console.log);
	}

	/**
	 * Logs an error message to the console with a red color.
	 *
	 * @param text - The error message to be logged.
	 */
	error(text: string) {
		this.printTo(text, red, console.error);
	}

	/**
	 * Logs a warning message to the console with a yellow color.
	 *
	 * @param text - The warning message to be logged.
	 */
	warn(text: string) {
		this.printTo(text, yellow, console.warn);
	}
}
