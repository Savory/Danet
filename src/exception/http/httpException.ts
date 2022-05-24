import { HTTP_STATUS } from './enum.ts';

export class HttpException extends Error {
	constructor(
		readonly statusCode: number,
		readonly description: string,
		readonly name = 'HttpException',
	) {
		super(`${statusCode} - ${description}`);
		this.name = name;
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class ForbiddenException extends HttpException {
	constructor() {
		super(HTTP_STATUS.FORBIDDEN, 'Forbidden', 'ForbiddenException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class BadRequestException extends HttpException {
	constructor() {
		super(HTTP_STATUS.BAD_REQUEST, 'Bad request', 'BadRequestException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class UnauthorizedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized', 'UnauthorizedException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class PaymentRequiredException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.PAYMENT_REQUIRED,
			'Payment required',
			'PaymentRequiredException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class NotFoundException extends HttpException {
	constructor() {
		super(HTTP_STATUS.NOT_FOUND, 'Not found', 'NotFoundException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class MethodNotAllowedException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.METHOD_NOT_ALLOWED,
			'Method not allowed',
			'MethodNotAllowedException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class NotAcceptableException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.NOT_ACCEPTABLE,
			'Not acceptable',
			'NotAcceptableException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class ProxyAuthenticationRequiredException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.PROXY_AUTHENTICATION_REQUIRED,
			'Proxy authentication required',
			'ProxyAuthenticationRequiredException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class RequestTimeoutException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.REQUEST_TIMEOUT,
			'Request timeout',
			'RequestTimeoutException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class ConflictException extends HttpException {
	constructor() {
		super(HTTP_STATUS.CONFLICT, 'Conflict', 'ConflictException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class GoneException extends HttpException {
	constructor() {
		super(HTTP_STATUS.GONE, 'Gone', 'GoneException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class LengthRequiredException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.LENGTH_REQUIRED,
			'Length required',
			'LengthRequiredException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class PreconditionFailedException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.PRECONDITION_FAILED,
			'Precondition failed',
			'PreconditionFailedException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class PayloadTooLargeException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.PAYLOAD_TOO_LARGE,
			'Payload too large',
			'PayloadTooLargeException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class URITooLongException extends HttpException {
	constructor() {
		super(HTTP_STATUS.URI_TOO_LONG, 'URI too long', 'URITooLongException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class UnsupportedMediaTypeException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE,
			'Unsupported media type',
			'UnsupportedMediaTypeException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class RequestedRangeNotSatisfiableException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.REQUESTED_RANGE_NOT_SATISFIABLE,
			'Requested range not statisfiable',
			'RequestedRangeNotSatisfiableException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class ExpectationFailedException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.EXPECTATION_FAILED,
			'Expectation failed',
			'ExpectationFailedException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class IAmATeapotException extends HttpException {
	constructor() {
		super(HTTP_STATUS.I_AM_A_TEAPOT, 'I am a teapot', 'IAmATeapotException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class MisdirectedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.MISDIRECTED, 'Misdirected', 'MisdirectedException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class UnprocessableEntityException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.UNPROCESSABLE_ENTITY,
			'Unprocessable entity',
			'UnprocessableEntityException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class FailedDependencyException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.FAILED_DEPENDENCY,
			'Failed dependency',
			'FailedDependencyException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class PreconditionRequiredException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.PRECONDITION_REQUIRED,
			'Precondition required',
			'PreconditionException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class TooManyRequestsException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.TOO_MANY_REQUESTS,
			'Too many requests',
			'TooManyRequestsException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class InternalServerErrorException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
			'Internal server error',
			'InternalServerErrorException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class NotImplementedException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.NOT_IMPLEMENTED,
			'Not implemented',
			'NotImplementedException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class BadGatewayException extends HttpException {
	constructor() {
		super(HTTP_STATUS.BAD_GATEWAY, 'Bad gateway', 'BadGatewayException');
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class ServiceUnavailableException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.SERVICE_UNAVAILABLE,
			'Service unavailable',
			'ServiceUnavailableException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class GatewayTimeoutException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.GATEWAY_TIMEOUT,
			'Gateway timeout',
			'GatewayTimeoutException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}

export class HttpVersionNotSupportedException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.HTTP_VERSION_NOT_SUPPORTED,
			'Http version not supported',
			'HttpVersionNotSupportedException',
		);
		Object.setPrototypeOf(this, HttpException.prototype);
	}
}
