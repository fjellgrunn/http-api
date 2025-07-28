import { ApiParams } from "../api";
import { getHttp } from "./http";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "getMethod");

export interface GetMethodOptions {
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

function getMethod(apiParams: ApiParams) {

  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): GetMethodOptions => ({
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
    getOptions: Partial<GetMethodOptions> = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(apiParams),
      ...getOptions,
    };
    logger.debug("httpGet Request: %j, %j", path, options);
    const s: S = await http<S>("GET", path, null, options);
    logger.default("httpGet Result: %j", s);
    return s;
  }
}

export { getMethod };