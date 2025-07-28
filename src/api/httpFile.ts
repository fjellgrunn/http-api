 
import { ApiParams } from "../api";
import { generateQueryParameters } from "./util";

export interface HttpFileOptions {
  isJson: boolean;
  accept: string;
  params: {
    [key: string]: string | number | boolean | Date | undefined
  };
  isAuthenticated: boolean;
  requestCredentials: RequestCredentials;
};

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
    file: { buffer: Buffer; bufferName: string },
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
      headers["Accept"] = options.accept;
      // console.debug("httpFile: " + JSON.stringify(options));
      headers["X-Client-Name"] = config.clientName;

      await populateAuthHeader(options.isAuthenticated, headers);

      const bodyData = new FormData();
      Object.keys(body).forEach(key => {
        bodyData.set(key, body[key]);
      });
      bodyData.set('file', new Blob([file.buffer]), file.bufferName);

      const response = await fetch(
        `${config.url}${path}${generateQueryParameters(options.params)}`,
        {
          method,
          headers,
          body: bodyData,
          credentials: options.requestCredentials,
        },
      );

      const returnValue = options.isJson ? await response.json() : await response.text();
      if (response.status >= 400) {
        console.error(
          `Error executing API request httpFile, status: ${response.status}: ` +
          JSON.stringify({ method, path, params: options.params, body, returnValue }),
        );
        throw new Error(options.isJson ? returnValue.message : returnValue);
      }
      return returnValue as unknown as S;
    } catch (e: any) {
      console.error(
        `Error executing API request http ${method} ${path} ${generateQueryParameters(
          options.params,
        )}`,
        e,
      );
      throw e;
    }
  };
}

export { getHttpFile };