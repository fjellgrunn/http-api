import { ApiParams } from "../api";
import { getHttp } from "./http";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "connectMethod");

export interface ConnectMethodOptions {
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

function connectMethod(apiParams: ApiParams) {
  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): ConnectMethodOptions => ({
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
    options: Partial<ConnectMethodOptions> = {},
  ): Promise<S> => {
    const opts = {
      ...getOptionDefaults(apiParams),
      ...options,
    };
    logger.debug("httpConnect Request: %j, %j", path, opts);
    const s: S = await http<S>("CONNECT", path, null, opts);
    logger.default("httpConnect Result: %j", s);
    return s;
  };
}

export { connectMethod };
