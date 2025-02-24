import { ApiParams } from "@/api";
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
} from "@/errors";
import { generateQueryParameters } from "./util";

import LibLogger from "@/logger";

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

    const response = await fetch(
      `${config.url}${path}${generateQueryParameters(options.params)}`,
      {
        method,
        headers,
        body: body ? (options.isJsonBody ? JSON.stringify(body) : body) : null,
        credentials: options.requestCredentials,
      },
    );

    // Handle the Errors - anything above 400
    let returnValue;
    returnValue = await response.text();

    if (response.status >= 400) {
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

      // console.debug(`API ERROR: Error executing API request:` + JSON.stringify(error));
      throw error;
    }

    if (options.isJson) {
      try {
        returnValue = JSON.parse(returnValue);
        logger.default("API RESPONSE JSON: %j", { status: response.status, body: returnValue });
      } catch (e: any) {
        logger.error('Error parsing JSON', { message: e.message, stack: e.stack, returnValue });
        throw e;
      }
    } else {
      logger.default("API RESPONSE TEXT: %j", { status: response.status, body: returnValue });
    }

    return returnValue as unknown as S;
  }
}

export {
  getHttp,
}