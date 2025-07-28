import { ApiParams } from "../api";
import { generateQueryParameters } from "./util";

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
