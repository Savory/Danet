// deno-lint-ignore-file no-explicit-any ban-types
import { HTTP_STATUS as HttpStatus } from './enum.ts';
// import { HTTP_STATUS } from './enum.ts';
import { HttpException, HttpExceptionOptions } from './http.exception.ts';

// export class HttpException extends Error {
// 	constructor(readonly status: number, description: string) {
// 		super(`${status} - ${description}`);
// 		this.name = this.constructor.name;
// 	}
// }

export class ForbiddenException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Forbidden',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.FORBIDDEN,
			),
			HttpStatus.FORBIDDEN,
			httpExceptionOptions,
		);
	}
}

export class BadRequestException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Bad Request',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);
		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.BAD_REQUEST,
			),
			HttpStatus.BAD_REQUEST,
			httpExceptionOptions,
		);
	}
}

export class UnauthorizedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Unauthorized',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.UNAUTHORIZED,
			),
			HttpStatus.UNAUTHORIZED,
			httpExceptionOptions,
		);
	}
}

// do not exists in nestJS
export class PaymentRequiredException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Payment required',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.PAYMENT_REQUIRED,
			),
			HttpStatus.PAYMENT_REQUIRED,
			httpExceptionOptions,
		);
	}
}

export class NotFoundException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Not Found',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.NOT_FOUND,
			),
			HttpStatus.NOT_FOUND,
			httpExceptionOptions,
		);
	}
}

export class MethodNotAllowedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Method Not Allowed',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.METHOD_NOT_ALLOWED,
			),
			HttpStatus.METHOD_NOT_ALLOWED,
			httpExceptionOptions,
		);
	}
}

export class NotAcceptableException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Not Acceptable',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.NOT_ACCEPTABLE,
			),
			HttpStatus.NOT_ACCEPTABLE,
			httpExceptionOptions,
		);
	}
}
// do not exists in nestJS
export class ProxyAuthenticationRequiredException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Proxy authentication required',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.PROXY_AUTHENTICATION_REQUIRED,
			),
			HttpStatus.PROXY_AUTHENTICATION_REQUIRED,
			httpExceptionOptions,
		);
	}
}

export class RequestTimeoutException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Request Timeout',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.REQUEST_TIMEOUT,
			),
			HttpStatus.REQUEST_TIMEOUT,
			httpExceptionOptions,
		);
	}
}

export class ConflictException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Conflict',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(objectOrError, description, HttpStatus.CONFLICT),
			HttpStatus.CONFLICT,
			httpExceptionOptions,
		);
	}
}

export class GoneException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Gone',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(objectOrError, description, HttpStatus.GONE),
			HttpStatus.GONE,
			httpExceptionOptions,
		);
	}
}

export class LengthRequiredException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Length required',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.LENGTH_REQUIRED,
			),
			HttpStatus.LENGTH_REQUIRED,
			httpExceptionOptions,
		);
	}
}

export class PreconditionFailedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Precondition Failed',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.PRECONDITION_FAILED,
			),
			HttpStatus.PRECONDITION_FAILED,
			httpExceptionOptions,
		);
	}
}

export class PayloadTooLargeException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Payload too large',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.PAYLOAD_TOO_LARGE,
			),
			HttpStatus.PAYLOAD_TOO_LARGE,
			httpExceptionOptions,
		);
	}
}

export class URITooLongException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'URI too long',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.URI_TOO_LONG,
			),
			HttpStatus.URI_TOO_LONG,
			httpExceptionOptions,
		);
	}
}

export class UnsupportedMediaTypeException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Unsupported media type',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.UNSUPPORTED_MEDIA_TYPE,
			),
			HttpStatus.UNSUPPORTED_MEDIA_TYPE,
			httpExceptionOptions,
		);
	}
}

export class RequestedRangeNotSatisfiableException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Requested range not statisfiable',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
			),
			HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE,
			httpExceptionOptions,
		);
	}
}

export class ExpectationFailedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Expectation failed',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.EXPECTATION_FAILED,
			),
			HttpStatus.EXPECTATION_FAILED,
			httpExceptionOptions,
		);
	}
}

export class IAmATeapotException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'I am a teapot',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.I_AM_A_TEAPOT,
			),
			HttpStatus.I_AM_A_TEAPOT,
			httpExceptionOptions,
		);
	}
}

export class MisdirectedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Misdirected',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.MISDIRECTED,
			),
			HttpStatus.MISDIRECTED,
			httpExceptionOptions,
		);
	}
}

export class UnprocessableEntityException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Unprocessable entity',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.UNPROCESSABLE_ENTITY,
			),
			HttpStatus.UNPROCESSABLE_ENTITY,
			httpExceptionOptions,
		);
	}
}

export class FailedDependencyException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Failed dependency',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.FAILED_DEPENDENCY,
			),
			HttpStatus.FAILED_DEPENDENCY,
			httpExceptionOptions,
		);
	}
}

export class PreconditionRequiredException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Precondition required',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.PRECONDITION_REQUIRED,
			),
			HttpStatus.PRECONDITION_REQUIRED,
			httpExceptionOptions,
		);
	}
}

export class TooManyRequestsException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Too many requests',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.TOO_MANY_REQUESTS,
			),
			HttpStatus.TOO_MANY_REQUESTS,
			httpExceptionOptions,
		);
	}
}

export class InternalServerErrorException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Internal server error',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.INTERNAL_SERVER_ERROR,
			),
			HttpStatus.INTERNAL_SERVER_ERROR,
			httpExceptionOptions,
		);
	}
}

export class NotImplementedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Not implemented',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.NOT_IMPLEMENTED,
			),
			HttpStatus.NOT_IMPLEMENTED,
			httpExceptionOptions,
		);
	}
}

export class BadGatewayException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Bad gateway',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.BAD_GATEWAY,
			),
			HttpStatus.BAD_GATEWAY,
			httpExceptionOptions,
		);
	}
}

export class ServiceUnavailableException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Service unavailable',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.SERVICE_UNAVAILABLE,
			),
			HttpStatus.SERVICE_UNAVAILABLE,
			httpExceptionOptions,
		);
	}
}

export class GatewayTimeoutException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Gateway timeout',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.GATEWAY_TIMEOUT,
			),
			HttpStatus.GATEWAY_TIMEOUT,
			httpExceptionOptions,
		);
	}
}

export class HttpVersionNotSupportedException extends HttpException {
	constructor(
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions =
			'Http version not supported',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
			),
			HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
			httpExceptionOptions,
		);
	}
}

export class NotValidBodyException<T> extends HttpException {
	reasons: T;

	constructor(
		reasons: T,
		objectOrError?: string | object | any,
		descriptionOrOptions: string | HttpExceptionOptions = 'Body bad formatted',
	) {
		const { description, httpExceptionOptions } = HttpException
			.extractDescriptionAndOptionsFrom(descriptionOrOptions);

		super(
			HttpException.createBody(
				objectOrError,
				description,
				HttpStatus.BAD_REQUEST,
			),
			HttpStatus.BAD_REQUEST,
			httpExceptionOptions,
		);
		this.reasons = reasons;
	}
}
