import { ApiParams } from "../api";
import {
  BadRequestError,
  ClientError,
  ConflictError,
  ForbiddenError,
  GoneError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  NotImplementedError,
  RequestTimeoutError,
  ServerError,
  ServiceUnavailableError,
  TooManyRequestsError,
  UnauthorizedError
} from "../errors";
import { type ErrorInfo, FjellHttpError } from "../errors/FjellHttpError";
import { generateQueryParameters } from "./util";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "http");

export interface HttpMethodOptions {
  isJson: boolean;
  isJsonBody: boolean;
  contentType: string;
  accept: string;
  params: { [key: string]: string | number | boolean | Date | undefined };
  isAuthenticated: boolean;
  skipContentType: boolean;
  requestCredentials: RequestCredentials;
};

function getHttp(apiParams: ApiParams) {

  const getOptionDefaults =
    (apiParams: ApiParams): HttpMethodOptions => ({
      isJson: true,
      isJsonBody: true,
      contentType: "application/json",
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: apiParams.config.requestCredentials,
    });

  return async <S>(
    method: string,
    path: string,
    body: any = {},
    httpOptions: Partial<HttpMethodOptions> = {},
  ): Promise<S> => {
    logger.trace('http', { method, path, body, httpOptions });

    const options = {
      ...getOptionDefaults(apiParams),
      ...httpOptions,
    };

    const config = apiParams.config;
    const populateAuthHeader = apiParams.populateAuthHeader;
    const headers: { [key: string]: string } = {};
    if (!options.skipContentType) {
      headers["Content-Type"] = options.contentType;
    }
    headers["Accept"] = options.accept;
    headers["X-Client-Name"] = config.clientName;

    const debugOptions = {
      ...options,
      method,
      path,
      body,
    };
    // console.debug("API REQUEST: " + JSON.stringify(debugOptions, null, 2));

    await populateAuthHeader(options.isAuthenticated, headers);

    logger.debug("http Request: %j, %j", method, path);

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: options.requestCredentials,
    };

    if (method !== "GET" && method !== "HEAD") {
      fetchOptions.body = body ? (options.isJsonBody ? JSON.stringify(body) : body) : null;
    }

    const fullUrl = `${config.url}${path}${generateQueryParameters(options.params)}`;
    const response = await fetch(fullUrl, fetchOptions);

    // Get response body
    let returnValue;
    returnValue = await response.text();

    // Handle errors - anything above 400
    if (response.status >= 400) {
      // Try to parse as JSON to check for structured Fjell error
      let errorBody: any;

      try {
        errorBody = JSON.parse(returnValue);
        
        // Check if this is a structured Fjell error response
        if (errorBody.success === false && errorBody.error && isErrorInfo(errorBody.error)) {
          const fjellErrorInfo = errorBody.error as ErrorInfo;
          
          logger.debug('Received Fjell error response', {
            error: fjellErrorInfo,
            status: response.status,
            url: fullUrl
          });

          // Throw FjellHttpError with full context
          throw new FjellHttpError(
            fjellErrorInfo.message,
            fjellErrorInfo,
            response.status,
            {
              method,
              url: fullUrl,
              headers,
              body
            }
          );
        }
      } catch (parseError) {
        // If it's a FjellHttpError, re-throw it
        if (parseError instanceof FjellHttpError) {
          throw parseError;
        }
        // Otherwise, continue with legacy error handling
      }

      // Legacy error handling for non-Fjell error responses
      let error;
      if (response.status >= 500) {
        if (response.status === 500) {
          error = new InternalServerError(response.statusText, path, debugOptions);
        } else if (response.status === 501) {
          error = new NotImplementedError(response.statusText, path, debugOptions);
        } else if (response.status === 503) {
          error = new ServiceUnavailableError(response.statusText, path, debugOptions);
        } else {
          error = new ServerError(response.statusText, path, response.status, debugOptions);
        }
      } else {
        if (response.status === 400) {
          error = new BadRequestError(response.statusText, path, debugOptions);
        } else if (response.status === 401) {
          error = new UnauthorizedError(response.statusText, path, debugOptions);
        } else if (response.status === 403) {
          error = new ForbiddenError(response.statusText, path, debugOptions);
        } else if (response.status === 404) {
          error = new NotFoundError(response.statusText, path, debugOptions);
        } else if (response.status === 405) {
          error = new MethodNotAllowedError(response.statusText, path, debugOptions);
        } else if (response.status === 408) {
          error = new RequestTimeoutError(response.statusText, path, debugOptions);
        } else if (response.status === 409) {
          error = new ConflictError(response.statusText, path, debugOptions);
        } else if (response.status === 410) {
          error = new GoneError(response.statusText, path, debugOptions);
        } else if (response.status === 429) {
          error = new TooManyRequestsError(response.statusText, path, debugOptions);
        } else {
          error = new ClientError(response.statusText, path, response.status, debugOptions);
        }
      }

      throw error;
    }

    // Handle successful responses
    if (options.isJson) {
      try {
        returnValue = JSON.parse(returnValue);
        
        // Handle API response wrapper { success: true, data: ... }
        if (returnValue && typeof returnValue === 'object' && returnValue.success === true && 'data' in returnValue) {
          logger.default("API RESPONSE JSON (unwrapped): %j", { status: response.status, body: returnValue.data });
          return returnValue.data as unknown as S;
        }
        
        logger.default("API RESPONSE JSON: %j", { status: response.status, body: returnValue });
      } catch (e: any) {
        logger.error('Error parsing JSON', { message: e.message, stack: e.stack, returnValue });
        throw e;
      }
    } else {
      logger.default("API RESPONSE TEXT: %j", { status: response.status, body: returnValue });
    }

    return returnValue as unknown as S;
  };

  /**
   * Type guard to check if an object is ErrorInfo
   */
  function isErrorInfo(obj: any): obj is ErrorInfo {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.code === 'string' &&
      typeof obj.message === 'string' &&
      typeof obj.operation === 'object' &&
      typeof obj.context === 'object'
    );
  }
}

export {
  getHttp,
}