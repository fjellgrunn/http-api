import { ApiParams } from "../api";
import { getHttp } from "./http";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "traceMethod");

export interface TraceMethodOptions {
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

function traceMethod(apiParams: ApiParams) {
  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): TraceMethodOptions => ({
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
    options: Partial<TraceMethodOptions> = {},
  ): Promise<S> => {
    const opts = {
      ...getOptionDefaults(apiParams),
      ...options,
    };
    logger.debug("httpTrace Request: %j, %j", path, opts);
    const s: S = await http<S>("TRACE", path, null, opts);
    logger.default("httpTrace Result: %j", s);
    return s;
  };
}

export { traceMethod };
