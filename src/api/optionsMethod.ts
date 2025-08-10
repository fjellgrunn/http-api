import { ApiParams } from "../api";
import { getHttp } from "./http";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "optionsMethod");

export interface OptionsMethodOptions {
  isJson: boolean;
  isJsonBody: boolean;
  contentType: string;
  accept: string;
  params: {
    [key: string]: string | number | boolean | Date | undefined;
  };
  isAuthenticated: boolean;
  skipContentType: boolean;
  requestCredentials: RequestCredentials;
};

function optionsMethod(apiParams: ApiParams) {
  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): OptionsMethodOptions => ({
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
    options: Partial<OptionsMethodOptions> = {},
  ): Promise<S> => {
    const opts = {
      ...getOptionDefaults(apiParams),
      ...options,
    };
    logger.debug("httpOptions Request: %j, %j", path, opts);
    const s: S = await http<S>("OPTIONS", path, null, opts);
    logger.default("httpOptions Result: %j", s);
    return s;
  };
}

export { optionsMethod };
