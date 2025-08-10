import { ApiParams } from "../api";
import { getHttp } from "./http";

import LibLogger from "../logger";

const logger = LibLogger.get("api", "patchMethod");

export interface PatchMethodOptions {
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

function patchMethod(apiParams: ApiParams) {
  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): PatchMethodOptions => ({
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
    options: Partial<PatchMethodOptions> = {},
  ): Promise<S> => {
    const opts = {
      ...getOptionDefaults(apiParams),
      ...options,
    };
    logger.debug("httpPatch Request: %j, %j", path, opts);
    const s: S = await http<S>("PATCH", path, body, opts);
    logger.default("httpPatch Result: %j", s);
    return s;
  };
}

export { patchMethod };
