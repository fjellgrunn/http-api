import { ApiParams } from "@/api";
import { getHttp } from "./http";

export interface PostMethodOptions {
  isJson: boolean;
  isJsonBody: boolean;
  contentType: string;
  accept: string;
  params: {
    [key: string]: string | number | boolean | Date | undefined
  };
  isAuthenticated: boolean;
  skipContentType: boolean;
  requestCredentials: RequestCredentials;
};

function postMethod(apiParams: ApiParams) {

  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): PostMethodOptions => ({
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
    path: string,
    body: any = {},
    getOptions: Partial<PostMethodOptions> = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(apiParams),
      ...getOptions,
    };
    // console.debug("httpPost: " + JSON.stringify({ path, body, options }, null, 2));
    return http<S>("POST", path, body, options);
  };
}

export { postMethod };
