import { ApiParams } from "@/api";
import { getHttp } from "./http";

import LibLogger from "@/logger";

const logger = LibLogger.get("api", "deleteMethod");

export interface DeleteMethodOptions {
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

function deleteMethod(apiParams: ApiParams) {

  const http = getHttp(apiParams);

  const getOptionDefaults =
    (apiParams: ApiParams): DeleteMethodOptions => ({
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
    deleteOptions: Partial<DeleteMethodOptions> = {},
  ): Promise<S> => {
    const options = {
      ...getOptionDefaults(apiParams),
      ...deleteOptions,
    };
    logger.debug("httpDelete Request: %j, %j", path, options);
    const s: S = await http<S>(
      "DELETE",
      path,
      body,
      options,
    );
    logger.default("httpDelete Result: %j", s);
    return s;
  };
}

export { deleteMethod }
