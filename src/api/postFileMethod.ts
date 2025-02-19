/* eslint-disable max-params */
import { ApiParams } from "@/api";
import { getHttpFile } from "./httpFile";

export interface PostFileMethodOptions {
  isJson: boolean;
  accept: string;
  params: {
    [key: string]: string | number | boolean | Date | undefined
  };
  isAuthenticated: boolean;
  requestCredentials: RequestCredentials;
};

function postFileMethod(apiParams: ApiParams) {

  const httpFile = getHttpFile(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): PostFileMethodOptions => ({
      isJson: true,
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      requestCredentials: apiParams.config.requestCredentials,
    });

  return async <S>(
    path: string,
    body: any = {},
    headers: any = {},
    file: { buffer: Buffer; bufferName: string },
    postFileOptions: Partial<PostFileMethodOptions> = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(apiParams),
      ...postFileOptions,
    };
    // console.debug("httpPostFormData: " + JSON.stringify(options));
    return httpFile<S>(
      "POST",
      path,
      file,
      options,
      body,
      headers,
    );
  };
}

export { postFileMethod }
