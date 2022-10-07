import { HTTP_STATUS } from './enum.ts';

export class HttpException extends Error {
	constructor(readonly status: number, description: string) {
		super(`${status} - ${description}`);
		this.name = this.constructor.name;
	}
}

export class ForbiddenException extends HttpException {
	constructor() {
		super(HTTP_STATUS.FORBIDDEN, 'Forbidden');
	}
}

export class BadRequestException extends HttpException {
	constructor() {
		super(HTTP_STATUS.BAD_REQUEST, 'Bad request');
	}
}

export class UnauthorizedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
	}
}

export class PaymentRequiredException extends HttpException {
	constructor() {
		super(HTTP_STATUS.PAYMENT_REQUIRED, 'Payment required');
	}
}

export class NotFoundException extends HttpException {
	constructor() {
		super(HTTP_STATUS.NOT_FOUND, 'Not found');
	}
}

export class MethodNotAllowedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.METHOD_NOT_ALLOWED, 'Method not allowed');
	}
}

export class NotAcceptableException extends HttpException {
	constructor() {
		super(HTTP_STATUS.NOT_ACCEPTABLE, 'Not acceptable');
	}
}

export class ProxyAuthenticationRequiredException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.PROXY_AUTHENTICATION_REQUIRED,
			'Proxy authentication required',
		);
	}
}

export class RequestTimeoutException extends HttpException {
	constructor() {
		super(HTTP_STATUS.REQUEST_TIMEOUT, 'Request timeout');
	}
}

export class ConflictException extends HttpException {
	constructor() {
		super(HTTP_STATUS.CONFLICT, 'Conflict');
	}
}

export class GoneException extends HttpException {
	constructor() {
		super(HTTP_STATUS.GONE, 'Gone');
	}
}

export class LengthRequiredException extends HttpException {
	constructor() {
		super(HTTP_STATUS.LENGTH_REQUIRED, 'Length required');
	}
}

export class PreconditionFailedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.PRECONDITION_FAILED, 'Precondition failed');
	}
}

export class PayloadTooLargeException extends HttpException {
	constructor() {
		super(HTTP_STATUS.PAYLOAD_TOO_LARGE, 'Payload too large');
	}
}

export class URITooLongException extends HttpException {
	constructor() {
		super(HTTP_STATUS.URI_TOO_LONG, 'URI too long');
	}
}

export class UnsupportedMediaTypeException extends HttpException {
	constructor() {
		super(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, 'Unsupported media type');
	}
}

export class RequestedRangeNotSatisfiableException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.REQUESTED_RANGE_NOT_SATISFIABLE,
			'Requested range not statisfiable',
		);
	}
}

export class ExpectationFailedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.EXPECTATION_FAILED, 'Expectation failed');
	}
}

export class IAmATeapotException extends HttpException {
	constructor() {
		super(HTTP_STATUS.I_AM_A_TEAPOT, 'I am a teapot');
	}
}

export class MisdirectedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.MISDIRECTED, 'Misdirected');
	}
}

export class UnprocessableEntityException extends HttpException {
	constructor() {
		super(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Unprocessable entity');
	}
}

export class FailedDependencyException extends HttpException {
	constructor() {
		super(HTTP_STATUS.FAILED_DEPENDENCY, 'Failed dependency');
	}
}

export class PreconditionRequiredException extends HttpException {
	constructor() {
		super(HTTP_STATUS.PRECONDITION_REQUIRED, 'Precondition required');
	}
}

export class TooManyRequestsException extends HttpException {
	constructor() {
		super(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many requests');
	}
}

export class InternalServerErrorException extends HttpException {
	constructor() {
		super(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error');
	}
}

export class NotImplementedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.NOT_IMPLEMENTED, 'Not implemented');
	}
}

export class BadGatewayException extends HttpException {
	constructor() {
		super(HTTP_STATUS.BAD_GATEWAY, 'Bad gateway');
	}
}

export class ServiceUnavailableException extends HttpException {
	constructor() {
		super(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Service unavailable');
	}
}

export class GatewayTimeoutException extends HttpException {
	constructor() {
		super(HTTP_STATUS.GATEWAY_TIMEOUT, 'Gateway timeout');
	}
}

export class HttpVersionNotSupportedException extends HttpException {
	constructor() {
		super(HTTP_STATUS.HTTP_VERSION_NOT_SUPPORTED, 'Http version not supported');
	}
}

export class NotValidBodyException<T> extends HttpException {
	reasons: T;
	constructor(reasons: T) {
		super(HTTP_STATUS.BAD_REQUEST, 'Body bad formatted');
		this.reasons = reasons;
	}
}
