import { HTTP_STATUS } from './enum.ts';

export class HttpException {
  constructor(readonly status: number, readonly message: string) {}
}

export class ForbiddenHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.FORBIDDEN, "Forbidden");
  }
}

export class BadRequestHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.BAD_REQUEST, "Bad request");
  }
}

export class UnauthorizedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }
}

export class PaymentRequiredHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.PAYMENT_REQUIRED, "Payment required");
  }
}

export class NotFoundHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.NOT_FOUND, "Not found");
  }
}

export class MethodNotAllowedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.METHOD_NOT_ALLOWED, "Method not allowed");
  }
}

export class NotAcceptableHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.NOT_ACCEPTABLE, "Not acceptable");
  }
}

export class ProxyAuthenticationRequiredHttpException extends HttpException {
  constructor() {
    super(
      HTTP_STATUS.PROXY_AUTHENTICATION_REQUIRED,
      "Proxy authentication required"
    );
  }
}

export class RequestTimeoutHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.REQUEST_TIMEOUT, "Request timeout");
  }
}

export class ConflictHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.CONFLICT, "Conflict");
  }
}

export class GoneHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.GONE, "Gone");
  }
}

export class LengthRequiredHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.LENGTH_REQUIRED, "Length required");
  }
}

export class PreconditionFailedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.PRECONDITION_FAILED, "Precondition failed");
  }
}

export class PayloadTooLargeHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.PAYLOAD_TOO_LARGE, "Payload too large");
  }
}

export class URITooLongHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.URI_TOO_LONG, "URI too long");
  }
}

export class UnsupportedMediaTypeHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type");
  }
}

export class RequestedRangeNotSatisfiableHttpException extends HttpException {
  constructor() {
    super(
      HTTP_STATUS.REQUESTED_RANGE_NOT_SATISFIABLE,
      "Requested range not statisfiable"
    );
  }
}

export class ExpectationFailedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.EXPECTATION_FAILED, "Expectation failed");
  }
}

export class IAmATeapotHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.I_AM_A_TEAPOT, "I am a teapot");
  }
}

export class MisdirectedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.MISDIRECTED, "Misdirected");
  }
}

export class UnprocessableEntityHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.UNPROCESSABLE_ENTITY, "Unprocessable entity");
  }
}

export class FailedDependencyHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.FAILED_DEPENDENCY, "Failed dependency");
  }
}

export class PreconditionRequiredHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.PRECONDITION_REQUIRED, "Precondition required");
  }
}

export class TooManyRequestsHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.TOO_MANY_REQUESTS, "Too many requests");
  }
}

export class InternalServerErrorHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
  }
}

export class NotImplementedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.NOT_IMPLEMENTED, "Not implemented");
  }
}

export class BadGatewayHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.BAD_GATEWAY, "Bad gateway");
  }
}

export class ServiceUnavailableHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.SERVICE_UNAVAILABLE, "Service unavaible");
  }
}

export class GatewayTimeoutHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.GATEWAY_TIMEOUT, "Gateway timeout");
  }
}

export class HttpVersionNotSupportedHttpException extends HttpException {
  constructor() {
    super(HTTP_STATUS.HTTP_VERSION_NOT_SUPPORTED, "Http version not supported");
  }
}
