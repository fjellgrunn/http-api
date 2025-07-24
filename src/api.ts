import { deleteMethod, DeleteMethodOptions } from "./api/deleteMethod";
import { getMethod, GetMethodOptions } from "./api/getMethod";
import { postMethod, PostMethodOptions } from "./api/postMethod";
import { putMethod, PutMethodOptions } from "./api/putMethod";
import { postFileMethod, PostFileMethodOptions } from "./api/postFileMethod";
import { uploadAsyncMethod, UploadAsyncMethodOptions } from "./api/uploadAsyncMethod";

// Export option types for external use
export type { DeleteMethodOptions, GetMethodOptions, PostMethodOptions, PutMethodOptions };

export type HttpDelete = <S>(
  path: string,
  body?: any,
  options?: Partial<DeleteMethodOptions>,
) => Promise<S>;

export type HttpPut = <S>(
  path: string,
  body?: any,
  options?: Partial<PutMethodOptions>,
) => Promise<S>;

export type HttpPost = <S>(
  path: string,
  body?: any,
  options?: Partial<PostMethodOptions>,
) => Promise<S>;

export type HttpPostFile = <S>(
  path: string,
  body: any,
  headers: any,
  file: { buffer: Buffer; bufferName: string },
  options?: Partial<PostFileMethodOptions>,
) => Promise<S>;

export type HttpGet = <S>(
  path: string,
  getOptions?: Partial<GetMethodOptions>,
) => Promise<S>;

export type UploadAsync = <S>(
  path: string,
  uri: string,
  options?: Partial<UploadAsyncMethodOptions>,
) => Promise<S>;

export type HttpApi = {
  httpDelete: HttpDelete;
  httpGet: HttpGet;
  httpPut: HttpPut,
  httpPost: HttpPost,
  httpPostFile: HttpPostFile,
  uploadAsync: UploadAsync,
}

export type ApiConfig = {
  url: string,
  requestCredentials: RequestCredentials,
  clientName: string,
}

export type ApiPopulateAuthHeader =
  (isAuthenticated: boolean, headers: { [key: string]: string; }) => Promise<void>;

export type ApiUploadAsyncFile =
  (destUrl: string, fileUri: string, method: string,
    uploadType: string, fieldName: string, headers: { [key: string]: string }) => Promise<{
      headers: Record<string, string>;
      status: number;
      mimeType: string | null;
      body: string;
    }>;

export type ApiParams = {
  config: ApiConfig,
  populateAuthHeader: ApiPopulateAuthHeader,
  uploadAsyncFile: ApiUploadAsyncFile,
}

export const getHttpApi = (apiParams: ApiParams): HttpApi => {

  const httpDelete: HttpDelete = deleteMethod(apiParams);

  const httpGet: HttpGet = getMethod(apiParams);

  const httpPost: HttpPost = postMethod(apiParams)

  const httpPut: HttpPut = putMethod(apiParams);

  const httpPostFile: HttpPostFile = postFileMethod(apiParams);

  const uploadAsync: UploadAsync = uploadAsyncMethod(apiParams);

  return {
    httpDelete,
    httpGet,
    httpPut,
    httpPost,
    httpPostFile,
    uploadAsync,
  };

}
