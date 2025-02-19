
export type QueryParams = Record<string, string | number | boolean | Date>;

export type HttpOptions = {
  isJson?: boolean;
  isJsonBody?: boolean;
  contentType?: string;
  accept?: string;
  params?: QueryParams;
  isAuthenticated?: boolean;
  skipContentType?: boolean;
  headers?: { [key: string]: string };
};

