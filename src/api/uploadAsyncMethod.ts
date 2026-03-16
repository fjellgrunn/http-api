import { ApiParams } from "../api";
import { generateQueryParameters } from "./util";
import { type ErrorInfo, FjellHttpError } from "../errors/FjellHttpError";

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

      // console.debug("uploadAsync: " + JSON.stringify(options));

      await populateAuthHeader(options.isAuthenticated, options.headers);

      const result: {
        headers: Record<string, string>;
        status: number;
        mimeType: string | null;
        body: string;
      } = await uploadAsyncFile(`${config.url}${path}${generateQueryParameters(options.params)}`,
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
            {
              method: options.method,
              url: `${config.url}${path}${generateQueryParameters(options.params)}`,
              headers: options.headers,
              body: uri
            }
          );
        }

        throw new Error(`Upload failed with status ${result.status}`);
      }

      const returnValue = options.isJson ? JSON.parse(result.body) : result.body;
      return returnValue as unknown as S;
    } catch (e: any) {
      console.error(
        `Error executing API request http ${options.method} ${path} ${generateQueryParameters(
          options.params,
        )}`,
        e,
      );
      throw e;
    }
  };
}

export { uploadAsyncMethod }
