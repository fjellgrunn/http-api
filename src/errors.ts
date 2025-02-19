export class APIError extends Error {
  private httpResponseCode: number;
  private path: string;

  constructor(message: string, path: string, httpResponseCode: number, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, options);

    this.httpResponseCode = httpResponseCode;
    this.path = path;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

export class ClientError extends APIError {
  constructor(message: string, path: string, httpResponseCode: number, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, path, httpResponseCode, options);
  }
}

export class BadRequestError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 400, options);
  }
}

export class UnauthorizedError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 401, options);
  }
}

export class ForbiddenError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 403, options);
  }
}

export class NotFoundError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 404, options);
  }
}

export class MethodNotAllowedError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 405, options);
  }
}

export class RequestTimeoutError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 408, options);
  }
}

export class ConflictError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 409, options);
  }
}

export class GoneError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 410, options);
  }
}

export class TooManyRequestsError extends ClientError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(`${message} ${path}`, path, 429, options);
  }
}

export class ServerError extends APIError {
  constructor(message: string, path: string, httpResponseCode: number, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, path, httpResponseCode, options);
  }
}

export class InternalServerError extends ServerError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, path, 500, options);
  }
}

export class NotImplementedError extends ServerError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, path, 501, options);
  }
}

export class ServiceUnavailableError extends ServerError {
  constructor(message: string, path: string, options: any) {
    // Need to pass `options` as the second parameter to install the "cause" property.
    super(message, path, 503, options);
  }
}
