/**
 * HTTP exceptions
 */

import { HTTP_STATUS } from './enum.ts';

/**
 * Represents an HTTP exception with a status code and description.
 * Extends the built-in `Error` class.
 *
 * @class
 * @extends {Error}
 */
export class HttpException extends Error {
	/**
	 * Creates an instance of HttpException.
	 *
	 * @param {number} status - The HTTP status code associated with the exception.
	 * @param {string} description - A brief description of the exception.
	 */
	constructor(readonly status: number, description: string) {
		super(`${status} - ${description}`);
		this.name = this.constructor.name;
	}
}

/**
 * Represents a Forbidden HTTP exception.
 * Extends the `HttpException` class with a status code of 403.
 *
 * @class
 * @extends {HttpException}
 */
export class ForbiddenException extends HttpException {
	/**
	 * Creates an instance of ForbiddenException.
	 */
	constructor() {
		super(HTTP_STATUS.FORBIDDEN, 'Forbidden');
	}
}

/**
 * Represents a Bad Request HTTP exception.
 * Extends the `HttpException` class with a status code of 400.
 *
 * @class
 * @extends {HttpException}
 */
export class BadRequestException extends HttpException {
	/**
	 * Creates an instance of BadRequestException.
	 */
	constructor() {
		super(HTTP_STATUS.BAD_REQUEST, 'Bad request');
	}
}

/**
 * Represents an Unauthorized HTTP exception.
 * Extends the `HttpException` class with a status code of 401.
 *
 * @class
 * @extends {HttpException}
 */
export class UnauthorizedException extends HttpException {
	/**
	 * Creates an instance of UnauthorizedException.
	 */
	constructor() {
		super(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized');
	}
}

/**
 * Represents a Payment Required HTTP exception.
 * Extends the `HttpException` class with a status code of 402.
 *
 * @class
 * @extends {HttpException}
 */
export class PaymentRequiredException extends HttpException {
	/**
	 * Creates an instance of PaymentRequiredException.
	 */
	constructor() {
		super(HTTP_STATUS.PAYMENT_REQUIRED, 'Payment required');
	}
}

/**
 * Represents a Not Found HTTP exception.
 * Extends the `HttpException` class with a status code of 404.
 *
 * @class
 * @extends {HttpException}
 */
export class NotFoundException extends HttpException {
	/**
	 * Creates an instance of NotFoundException.
	 */
	constructor() {
		super(HTTP_STATUS.NOT_FOUND, 'Not found');
	}
}

/**
 * Represents a Method Not Allowed HTTP exception.
 * Extends the `HttpException` class with a status code of 405.
 *
 * @class
 * @extends {HttpException}
 */
export class MethodNotAllowedException extends HttpException {
	/**
	 * Creates an instance of MethodNotAllowedException.
	 */
	constructor() {
		super(HTTP_STATUS.METHOD_NOT_ALLOWED, 'Method not allowed');
	}
}

/**
 * Represents a Not Acceptable HTTP exception.
 * Extends the `HttpException` class with a status code of 406.
 *
 * @class
 * @extends {HttpException}
 */
export class NotAcceptableException extends HttpException {
	/**
	 * Creates an instance of NotAcceptableException.
	 */
	constructor() {
		super(HTTP_STATUS.NOT_ACCEPTABLE, 'Not acceptable');
	}
}

/**
 * Represents a Proxy Authentication Required HTTP exception.
 * Extends the `HttpException` class with a status code of 407.
 *
 * @class
 * @extends {HttpException}
 */
export class ProxyAuthenticationRequiredException extends HttpException {
	/**
	 * Creates an instance of ProxyAuthenticationRequiredException.
	 */
	constructor() {
		super(
			HTTP_STATUS.PROXY_AUTHENTICATION_REQUIRED,
			'Proxy authentication required',
		);
	}
}

/**
 * Represents a Request Timeout HTTP exception.
 * Extends the `HttpException` class with a status code of 408.
 *
 * @class
 * @extends {HttpException}
 */
export class RequestTimeoutException extends HttpException {
	/**
	 * Creates an instance of RequestTimeoutException.
	 */
	constructor() {
		super(HTTP_STATUS.REQUEST_TIMEOUT, 'Request timeout');
	}
}

/**
 * Represents a Conflict HTTP exception.
 * Extends the `HttpException` class with a status code of 409.
 *
 * @class
 * @extends {HttpException}
 */
export class ConflictException extends HttpException {
	/**
	 * Creates an instance of ConflictException.
	 */
	constructor() {
		super(HTTP_STATUS.CONFLICT, 'Conflict');
	}
}

/**
 * Represents a Gone HTTP exception.
 * Extends the `HttpException` class with a status code of 410.
 *
 * @class
 * @extends {HttpException}
 */
export class GoneException extends HttpException {
	/**
	 * Creates an instance of GoneException.
	 */
	constructor() {
		super(HTTP_STATUS.GONE, 'Gone');
	}
}

/**
 * Represents a Length Required HTTP exception.
 * Extends the `HttpException` class with a status code of 411.
 *
 * @class
 * @extends {HttpException}
 */
export class LengthRequiredException extends HttpException {
	/**
	 * Creates an instance of LengthRequiredException.
	 */
	constructor() {
		super(HTTP_STATUS.LENGTH_REQUIRED, 'Length required');
	}
}

/**
 * Represents a Precondition Failed HTTP exception.
 * Extends the `HttpException` class with a status code of 412.
 *
 * @class
 * @extends {HttpException}
 */
export class PreconditionFailedException extends HttpException {
	/**
	 * Creates an instance of PreconditionFailedException.
	 */
	constructor() {
		super(HTTP_STATUS.PRECONDITION_FAILED, 'Precondition failed');
	}
}

/**
 * Represents a Payload Too Large HTTP exception.
 * Extends the `HttpException` class with a status code of 413.
 *
 * @class
 * @extends {HttpException}
 */
export class PayloadTooLargeException extends HttpException {
	/**
	 * Creates an instance of PayloadTooLargeException.
	 */
	constructor() {
		super(HTTP_STATUS.PAYLOAD_TOO_LARGE, 'Payload too large');
	}
}

/**
 * Represents a URI Too Long HTTP exception.
 * Extends the `HttpException` class with a status code of 414.
 *
 * @class
 * @extends {HttpException}
 */
export class URITooLongException extends HttpException {
	/**
	 * Creates an instance of URITooLongException.
	 */
	constructor() {
		super(HTTP_STATUS.URI_TOO_LONG, 'URI too long');
	}
}

/**
 * Represents an Unsupported Media Type HTTP exception.
 * Extends the `HttpException` class with a status code of 415.
 *
 * @class
 * @extends {HttpException}
 */
export class UnsupportedMediaTypeException extends HttpException {
	/**
	 * Creates an instance of UnsupportedMediaTypeException.
	 */
	constructor() {
		super(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, 'Unsupported media type');
	}
}

/**
 * Represents a Requested Range Not Satisfiable HTTP exception.
 * Extends the `HttpException` class with a status code of 416.
 *
 * @class
 * @extends {HttpException}
 */
export class RequestedRangeNotSatisfiableException extends HttpException {
	/**
	 * Creates an instance of RequestedRangeNotSatisfiableException.
	 */
	constructor() {
		super(
			HTTP_STATUS.REQUESTED_RANGE_NOT_SATISFIABLE,
			'Requested range not statisfiable',
		);
	}
}

/**
 * Represents an Expectation Failed HTTP exception.
 * Extends the `HttpException` class with a status code of 417.
 *
 * @class
 * @extends {HttpException}
 */
export class ExpectationFailedException extends HttpException {
	/**
	 * Creates an instance of ExpectationFailedException.
	 */
	constructor() {
		super(HTTP_STATUS.EXPECTATION_FAILED, 'Expectation failed');
	}
}

/**
 * Represents an I Am A Teapot HTTP exception.
 * Extends the `HttpException` class with a status code of 418.
 *
 * @class
 * @extends {HttpException}
 */
export class IAmATeapotException extends HttpException {
	/**
	 * Creates an instance of IAmATeapotException.
	 */
	constructor() {
		super(HTTP_STATUS.I_AM_A_TEAPOT, 'I am a teapot');
	}
}

/**
 * Represents a Misdirected HTTP exception.
 * Extends the `HttpException` class with a status code of 421.
 *
 * @class
 * @extends {HttpException}
 */
export class MisdirectedException extends HttpException {
	/**
	 * Creates an instance of MisdirectedException.
	 */
	constructor() {
		super(HTTP_STATUS.MISDIRECTED, 'Misdirected');
	}
}

/**
 * Represents an Unprocessable Entity HTTP exception.
 * Extends the `HttpException` class with a status code of 422.
 *
 * @class
 * @extends {HttpException}
 */
export class UnprocessableEntityException extends HttpException {
	/**
	 * Creates an instance of UnprocessableEntityException.
	 */
	constructor() {
		super(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Unprocessable entity');
	}
}

/**
 * Represents a Failed Dependency HTTP exception.
 * Extends the `HttpException` class with a status code of 424.
 *
 * @class
 * @extends {HttpException}
 */
export class FailedDependencyException extends HttpException {
	/**
	 * Creates an instance of FailedDependencyException.
	 */
	constructor() {
		super(HTTP_STATUS.FAILED_DEPENDENCY, 'Failed dependency');
	}
}

/**
 * Represents a Precondition Required HTTP exception.
 * Extends the `HttpException` class with a status code of 428.
 *
 * @class
 * @extends {HttpException}
 */
export class PreconditionRequiredException extends HttpException {
	/**
	 * Creates an instance of PreconditionRequiredException.
	 */
	constructor() {
		super(HTTP_STATUS.PRECONDITION_REQUIRED, 'Precondition required');
	}
}

/**
 * Represents a Too Many Requests HTTP exception.
 * Extends the `HttpException` class with a status code of 429.
 *
 * @class
 * @extends {HttpException}
 */
export class TooManyRequestsException extends HttpException {
	/**
	 * Creates an instance of TooManyRequestsException.
	 */
	constructor() {
		super(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many requests');
	}
}

/**
 * Represents an Internal Server Error HTTP exception.
 * Extends the `HttpException` class with a status code of 500.
 *
 * @class
 * @extends {HttpException}
 */
export class InternalServerErrorException extends HttpException {
	/**
	 * Creates an instance of InternalServerErrorException.
	 */
	constructor() {
		super(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Internal server error');
	}
}

/**
 * Represents a Not Implemented HTTP exception.
 * Extends the `HttpException` class with a status code of 501.
 *
 * @class
 * @extends {HttpException}
 */
export class NotImplementedException extends HttpException {
	/**
	 * Creates an instance of NotImplementedException.
	 */
	constructor() {
		super(HTTP_STATUS.NOT_IMPLEMENTED, 'Not implemented');
	}
}

/**
 * Represents a Bad Gateway HTTP exception.
 * Extends the `HttpException` class with a status code of 502.
 *
 * @class
 * @extends {HttpException}
 */
export class BadGatewayException extends HttpException {
	/**
	 * Creates an instance of BadGatewayException.
	 */
	constructor() {
		super(HTTP_STATUS.BAD_GATEWAY, 'Bad gateway');
	}
}

/**
 * Represents a Service Unavailable HTTP exception.
 * Extends the `HttpException` class with a status code of 503.
 *
 * @class
 * @extends {HttpException}
 */
export class ServiceUnavailableException extends HttpException {
	/**
	 * Creates an instance of ServiceUnavailableException.
	 */
	constructor() {
		super(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Service unavailable');
	}
}

/**
 * Represents a Gateway Timeout HTTP exception.
 * Extends the `HttpException` class with a status code of 504.
 *
 * @class
 * @extends {HttpException}
 */
export class GatewayTimeoutException extends HttpException {
	/**
	 * Creates an instance of GatewayTimeoutException.
	 */
	constructor() {
		super(HTTP_STATUS.GATEWAY_TIMEOUT, 'Gateway timeout');
	}
}

/**
 * Represents an HTTP Version Not Supported HTTP exception.
 * Extends the `HttpException` class with a status code of 505.
 *
 * @class
 * @extends {HttpException}
 */
export class HttpVersionNotSupportedException extends HttpException {
	/**
	 * Creates an instance of HttpVersionNotSupportedException.
	 */
	constructor() {
		super(HTTP_STATUS.HTTP_VERSION_NOT_SUPPORTED, 'Http version not supported');
	}
}

/**
 * Represents a Not Valid Body HTTP exception with additional reasons.
 * Extends the `HttpException` class with a status code of 400.
 *
 * @class
 * @extends {HttpException}
 * @template T
 */
export class NotValidBodyException<T> extends HttpException {
	reasons: T;
	/**
	 * Creates an instance of NotValidBodyException.
	 *
	 * @param {T} reasons - The reasons why the body is not valid.
	 */
	constructor(reasons: T) {
		super(HTTP_STATUS.BAD_REQUEST, 'Body bad formatted');
		this.reasons = reasons;
	}
}
