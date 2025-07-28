import { ApiParams } from "../api";
import { getHttp } from "./http";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "putMethod");

export interface PutMethodOptions {
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

function putMethod(apiParams: ApiParams) {

  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): PutMethodOptions => ({
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
    getOptions: Partial<PutMethodOptions> = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(apiParams),
      ...getOptions,
    };
    logger.debug("httpPut Request: %j, %j", path, options);
    const s: S = await http<S>("PUT", path, body, options);
    logger.default("httpPut Result: %j", s);
    return s;
  };
}

export { putMethod };
