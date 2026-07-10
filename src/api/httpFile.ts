
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
import { redactBody, redactHeaders, sanitizeRequestInfo } from "./redact";
import LibLogger from "../logger";

const logger = LibLogger.get("api", "httpFile");

export interface HttpFileOptions {
  isJson: boolean;
  accept: string;
  params: {
    [key: string]: string | number | boolean | Date | undefined
  };
  isAuthenticated: boolean;
  requestCredentials: RequestCredentials;
};

function isErrorInfo(obj: any): obj is ErrorInfo {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.code === "string" &&
    typeof obj.message === "string" &&
    typeof obj.operation === "object" &&
    typeof obj.context === "object"
  );
}

function getHttpFile(apiParams: ApiParams) {

  const getOptionDefaults =
    (apiParams: ApiParams): HttpFileOptions => ({
      isJson: true,
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      requestCredentials: apiParams.config.requestCredentials,
    });

  return async <S>(
    method: string,
    path: string,
    file: { buffer: Buffer | Uint8Array; bufferName: string },
    httpFileOptions: Partial<HttpFileOptions> = {},
    body: any = {},
    headers: { [key: string]: string } = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(apiParams),
      ...httpFileOptions,
    };
    const config = apiParams.config;
    const populateAuthHeader = apiParams.populateAuthHeader
    try {
      // FormData must set its own multipart Content-Type with boundary
      delete headers["Content-Type"];
      delete headers["content-type"];

      headers["Accept"] = options.accept;
      headers["X-Client-Name"] = config.clientName;

      await populateAuthHeader(options.isAuthenticated, headers);

      const safeHeaders = redactHeaders(headers);
      const safeBody = redactBody(body);
      const fullUrl = `${config.url}${path}${generateQueryParameters(options.params)}`;

      const bodyData = new FormData();
      Object.keys(body).forEach(key => {
        const value = body[key];
        if (value == null) {
          return;
        }
        // Arrays keep FormData's default string coercion (comma-joined).
        // Plain objects are JSON-stringified so they are not "[object Object]".
        if (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          !(value instanceof Blob) &&
          !(typeof File !== 'undefined' && value instanceof File)
        ) {
          bodyData.set(key, JSON.stringify(value));
        } else {
          bodyData.set(key, value as any);
        }
      });
      const fileBytes = file.buffer instanceof Uint8Array
        ? file.buffer
        : new Uint8Array(file.buffer as ArrayBuffer);
      // Copy into a plain ArrayBuffer-backed Uint8Array for Blob compatibility
      const blobPart = new Uint8Array(fileBytes);
      bodyData.set('file', new Blob([blobPart]), file.bufferName);

      const response = await fetch(
        fullUrl,
        {
          method,
          headers,
          body: bodyData,
          credentials: options.requestCredentials,
        },
      );

      // Read text first (mirrors http.ts) so non-JSON error bodies don't mask status
      let returnValue: any = await response.text();

      if (response.status >= 400) {
        let errorBody: any;
        try {
          errorBody = JSON.parse(returnValue);

          let fjellErrorInfo: ErrorInfo | null = null;
          if (errorBody.success === false && errorBody.error) {
            fjellErrorInfo = errorBody.error;
          } else if (isErrorInfo(errorBody)) {
            fjellErrorInfo = errorBody;
          }

          if (fjellErrorInfo) {
            logger.error('HTTP-API: httpFile structured Fjell error', {
              component: 'http-api',
              operation: 'httpFile',
              method,
              url: fullUrl,
              statusCode: response.status,
              errorCode: fjellErrorInfo.code,
              errorMessage: fjellErrorInfo.message,
              body: safeBody,
              headers: safeHeaders,
            });
            throw new FjellHttpError(
              fjellErrorInfo.message,
              fjellErrorInfo,
              response.status,
              sanitizeRequestInfo({
                method,
                url: fullUrl,
                headers,
                body,
              })
            );
          }
        } catch (parseError: any) {
          if (parseError instanceof FjellHttpError) {
            throw parseError;
          }
          // Fall through to legacy handling
        }

        logger.error(
          'HTTP-API: httpFile request failed',
          {
            component: 'http-api',
            operation: 'httpFile',
            method,
            path,
            statusCode: response.status,
            params: options.params,
            body: safeBody,
            headers: safeHeaders,
            returnValue: typeof returnValue === 'string'
              ? returnValue.substring(0, 200)
              : returnValue,
          },
        );

        const debugOptions = {
          ...options,
          method,
          path,
          body: safeBody,
          headers: safeHeaders,
        };

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
        } else if (response.status === 400) {
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
        throw error;
      }

      if (options.isJson) {
        if (typeof returnValue === 'string' && returnValue.trim() === '') {
          return null as unknown as S;
        }
        returnValue = JSON.parse(returnValue);
        if (returnValue && typeof returnValue === 'object' && returnValue.success === true && 'data' in returnValue) {
          return returnValue.data as unknown as S;
        }
      }
      return returnValue as unknown as S;
    } catch (e: any) {
      // Avoid double-logging already-classified HTTP errors
      if (
        e instanceof FjellHttpError ||
        e?.name === 'BadRequestError' ||
        e?.name === 'UnauthorizedError' ||
        e?.name === 'ForbiddenError' ||
        e?.name === 'NotFoundError' ||
        e?.name === 'ClientError' ||
        e?.name === 'ServerError' ||
        e?.name === 'InternalServerError' ||
        e?.name === 'ConflictError' ||
        e?.name === 'GoneError' ||
        e?.name === 'MethodNotAllowedError' ||
        e?.name === 'RequestTimeoutError' ||
        e?.name === 'TooManyRequestsError' ||
        e?.name === 'NotImplementedError' ||
        e?.name === 'ServiceUnavailableError'
      ) {
        throw e;
      }
      logger.error(
        `Error executing API request httpFile ${method} ${path}${generateQueryParameters(options.params)}`,
        {
          component: 'http-api',
          operation: 'httpFile',
          method,
          path,
          errorMessage: e?.message,
          errorType: e?.constructor?.name,
        },
      );
      throw e;
    }
  };
}

export { getHttpFile };
