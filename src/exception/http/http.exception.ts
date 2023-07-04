// import {
//   HttpExceptionBody,
//   HttpExceptionBodyMessage,
// } from '../interfaces/http/http-exception-body.interface';
// import { isObject, isString } from '../utils/shared.utils';

import { HttpExceptionBody, HttpExceptionBodyMessage } from "../../interfaces/http/http-exception-body.interface.ts";
import { isObject, isString } from "../../shared.utils.TS";

export interface HttpExceptionOptions {
  /** original cause of the error */
  cause?: unknown;
  description?: string;
}

export interface DescriptionAndOptions {
  description?: string;
  httpExceptionOptions?: HttpExceptionOptions;
}

export class HttpException extends Error {
  private readonly response: string | Record<string, any>;
  private readonly status: number;
  private readonly options?: HttpExceptionOptions;


 	// constructor(readonly status: number, description: string) {
  // }

  constructor(
    response: string | Record<string, any>,
    status: number,
    options?: HttpExceptionOptions,
  ) {
    super();
    this.response = response;
    this.status = status;
    this.options = options;
    this.initMessage();
    this.initName();
    this.initCause();
  }

  public cause: unknown;

  public initCause(): void {
    if (this.options?.cause) {
      this.cause = this.options.cause;
      return;
    }
  }

  public initMessage() {
    if (isString(this.response)) {
      this.message = this.response;
    } else if (
      isObject(this.response) &&
      isString((this.response as Record<string, any>).message)
    ) {
      this.message = (this.response as Record<string, any>).message;
    } else if (this.constructor) {
      this.message =
        this.constructor.name.match(/[A-Z][a-z]+|[0-9]+/g)?.join(' ') ??
        'Error';
    }
  }

  public initName(): void {
    this.name = this.constructor.name;
  }

  public getResponse(): string | object {
    return this.response;
  }

  public getStatus(): number {
    return this.status;
  }

  public static createBody(
    nil: null | '',
    message?: HttpExceptionBodyMessage,
    statusCode?: number,
  ): HttpExceptionBody;

  public static createBody(
    message: HttpExceptionBodyMessage,
    error: string,
    statusCode: number,
  ): HttpExceptionBody;

  public static createBody<Body extends Record<string, unknown>>(
    custom: Body,
  ): Body;

  public static createBody<Body extends Record<string, unknown>>(
    arg0: null | HttpExceptionBodyMessage | Body,
    arg1?: HttpExceptionBodyMessage | string,
    statusCode?: number,
  ): HttpExceptionBody | Body {
    if (!arg0) {
      return {
        message: arg1 || "Internal Danet error",
        statusCode: statusCode || 500,
      };
    }

    if (isString(arg0) || Array.isArray(arg0)) {
      return {
        message: arg0 || "Internal Danet error",
        error: arg1 as string,
        statusCode: statusCode || 500,
      };
    }

    return arg0;
  }

  public static getDescriptionFrom(
    descriptionOrOptions: string | HttpExceptionOptions,
  ): string {
    return isString(descriptionOrOptions)
      ? descriptionOrOptions as string
      : descriptionOrOptions?.description as string;
  }

  public static getHttpExceptionOptionsFrom(
    descriptionOrOptions: string | HttpExceptionOptions,
  ): HttpExceptionOptions {
    return isString(descriptionOrOptions) ? {} : descriptionOrOptions;
  }

  /**
   * Utility method used to extract the error description and httpExceptionOptions from the given argument.
   * This is used by inheriting classes to correctly parse both options.
   * @returns the error description and the httpExceptionOptions as an object.
   */
  public static extractDescriptionAndOptionsFrom(
    descriptionOrOptions: string | HttpExceptionOptions,
  ): DescriptionAndOptions {
    const description = isString(descriptionOrOptions)
      ? descriptionOrOptions
      : descriptionOrOptions?.description;

    const httpExceptionOptions = isString(descriptionOrOptions)
      ? {}
      : descriptionOrOptions;

    return {
      description,
      httpExceptionOptions,
    };
  }
}
