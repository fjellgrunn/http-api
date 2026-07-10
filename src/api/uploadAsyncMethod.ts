import { ApiParams } from "../api";
import { generateQueryParameters } from "./util";
import { type ErrorInfo, FjellHttpError } from "../errors/FjellHttpError";
import { sanitizeRequestInfo } from "./redact";
import LibLogger from "../logger";

const logger = LibLogger.get("api", "uploadAsyncMethod");

export interface UploadAsyncMethodOptions {
  method: string,
  isJson: boolean;
  accept: string;
  params: { [key: string]: string | number | boolean | Date | undefined };
  isAuthenticated: boolean;
  fieldName: string;
  headers: { [key: string]: string };
};

function uploadAsyncMethod(apiParams: ApiParams) {
  const isErrorInfo = (obj: any): obj is ErrorInfo => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.code === "string" &&
      typeof obj.message === "string" &&
      typeof obj.operation === "object" &&
      typeof obj.context === "object"
    );
  };

  const getOptionDefaults =
    (): UploadAsyncMethodOptions => ({
      method: "POST",
      isJson: true,
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      fieldName: "file",
      headers: {},
    });

  return async<S>(
    path: string,
    uri: string,
    uploadAsyncOptions: Partial<UploadAsyncMethodOptions> = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(),
      ...uploadAsyncOptions,
    };
    const config = apiParams.config;
    const populateAuthHeader = apiParams.populateAuthHeader;
    const uploadAsyncFile = apiParams.uploadAsyncFile;
    try {
      options.headers["Accept"] = options.accept;

      await populateAuthHeader(options.isAuthenticated, options.headers);

      const fullUrl = `${config.url}${path}${generateQueryParameters(options.params)}`;
      const result: {
        headers: Record<string, string>;
        status: number;
        mimeType: string | null;
        body: string;
      } = await uploadAsyncFile(fullUrl,
        uri, options.method, "multipart", options.fieldName, options.headers);

      if (result.status >= 400) {
        let parsedBody: any = null;
        try {
          parsedBody = JSON.parse(result.body);
        } catch {
          // Ignore parse errors and fall back to generic error below.
        }

        const structuredError =
          parsedBody?.success === false && isErrorInfo(parsedBody.error)
            ? parsedBody.error
            : (isErrorInfo(parsedBody) ? parsedBody : null);

        if (structuredError) {
          throw new FjellHttpError(
            structuredError.message,
            structuredError,
            result.status,
            sanitizeRequestInfo({
              method: options.method,
              url: fullUrl,
              headers: options.headers,
              body: uri
            })
          );
        }

        throw new Error(`Upload failed with status ${result.status}`);
      }

      if (options.isJson) {
        if (typeof result.body === 'string' && result.body.trim() === '') {
          return null as unknown as S;
        }
        return JSON.parse(result.body) as unknown as S;
      }
      return result.body as unknown as S;
    } catch (e: any) {
      if (e instanceof FjellHttpError) {
        throw e;
      }
      logger.error(
        `Error executing API request http ${options.method} ${path} ${generateQueryParameters(
          options.params,
        )}`,
        {
          component: 'http-api',
          operation: 'uploadAsyncMethod',
          method: options.method,
          path,
          errorMessage: e?.message,
          errorType: e?.constructor?.name,
        },
      );
      throw e;
    }
  };
}

export { uploadAsyncMethod }
