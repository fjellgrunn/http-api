import { ApiParams } from "@/api";
import { getHttp } from "./http";

import LibLogger from "@/logger";

const logger = LibLogger.get("api", "postMethod");

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
    logger.debug("httpPost Request: %j, %j", path, options);
    const s: S = await http<S>("POST", path, body, options);
    logger.default("httpPost Result: %j", s);
    return s;
  };
}

export { postMethod };
