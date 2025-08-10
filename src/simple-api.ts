// Simple API wrappers for easier use in examples and basic usage
import { getMethod, GetMethodOptions } from "./api/getMethod";
import { postMethod, PostMethodOptions } from "./api/postMethod";
import { putMethod, PutMethodOptions } from "./api/putMethod";
import { optionsMethod, OptionsMethodOptions } from "./api/optionsMethod";
import { connectMethod, ConnectMethodOptions } from "./api/connectMethod";
import { traceMethod, TraceMethodOptions } from "./api/traceMethod";
import { patchMethod, PatchMethodOptions } from "./api/patchMethod";
import { deleteMethod as deleteMethodFactory, DeleteMethodOptions } from "./api/deleteMethod";
import { postFileMethod as postFileMethodFactory, PostFileMethodOptions } from "./api/postFileMethod";
import { uploadAsyncMethod as uploadAsyncMethodFactory, UploadAsyncMethodOptions } from "./api/uploadAsyncMethod";
import type { ApiParams } from "./api";

// Extended options interfaces that include commonly used properties
export interface SimpleGetOptions extends Partial<GetMethodOptions> {
  headers?: { [key: string]: string };
  // Remove params override to avoid type conflicts
}

export interface SimplePostOptions extends Partial<PostMethodOptions> {
  headers?: { [key: string]: string };
  // Remove params override to avoid type conflicts
}

export interface SimplePutOptions extends Partial<PutMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimpleDeleteOptions extends Partial<DeleteMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimplePostFileOptions extends Partial<PostFileMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimpleUploadAsyncOptions extends Partial<UploadAsyncMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimpleOptionsOptions extends Partial<OptionsMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimpleConnectOptions extends Partial<ConnectMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimpleTraceOptions extends Partial<TraceMethodOptions> {
  headers?: { [key: string]: string };
}

export interface SimplePatchOptions extends Partial<PatchMethodOptions> {
  headers?: { [key: string]: string };
}

// Default configuration for examples
const defaultApiParams: ApiParams = {
  config: {
    url: '',
    requestCredentials: 'same-origin' as RequestCredentials,
    clientName: 'fjell-http-api-examples'
  },
  populateAuthHeader: async (isAuthenticated: boolean, headers: { [key: string]: string }) => {
    // Mock auth header population for examples
    if (isAuthenticated) {
      headers['Authorization'] = 'Bearer example-token';
    }
  },
  uploadAsyncFile: async () => {
    // Mock file upload for examples
    return {
      headers: {},
      status: 200,
      mimeType: 'application/json',
      body: JSON.stringify({ success: true })
    };
  }
};

// Create configured instances
const getImpl = getMethod(defaultApiParams);
const postImpl = postMethod(defaultApiParams);
const putImpl = putMethod(defaultApiParams);
const optionsImpl = optionsMethod(defaultApiParams);
const connectImpl = connectMethod(defaultApiParams);
const traceImpl = traceMethod(defaultApiParams);
const patchImpl = patchMethod(defaultApiParams);
const deleteImpl = deleteMethodFactory(defaultApiParams);
const postFileImpl = postFileMethodFactory(defaultApiParams);
const uploadAsyncImpl = uploadAsyncMethodFactory(defaultApiParams);

// Export simple functions that match the expected interface
export const get = <S>(path: string, options?: SimpleGetOptions): Promise<S> => {
  return getImpl(path, options);
};

export const post = <S>(path: string, body?: any, options?: SimplePostOptions): Promise<S> => {
  return postImpl(path, body, options);
};

export const put = <S>(path: string, body?: any, options?: SimplePutOptions): Promise<S> => {
  return putImpl(path, body, options);
};

export const deleteMethod = <S>(path: string, body?: any, options?: SimpleDeleteOptions): Promise<S> => {
  return deleteImpl(path, body, options);
};

export const options = <S>(path: string, opts?: SimpleOptionsOptions): Promise<S> => {
  return optionsImpl(path, opts);
};

export const connect = <S>(path: string, opts?: SimpleConnectOptions): Promise<S> => {
  return connectImpl(path, opts);
};

export const trace = <S>(path: string, opts?: SimpleTraceOptions): Promise<S> => {
  return traceImpl(path, opts);
};

export const patch = <S>(path: string, body?: any, opts?: SimplePatchOptions): Promise<S> => {
  return patchImpl(path, body, opts);
};

export const postFileMethod = <S>(path: string, file: File, options?: SimplePostFileOptions): Promise<S> => {
  // Convert File to the expected format - this is a simplified implementation
  // In a real implementation, you would read the File object properly using FileReader
  const fileBuffer = {
    buffer: Buffer.from([]), // Placeholder - would need proper File reading in browser
    bufferName: file.name
  };

  // Use default empty objects for body and headers, then the file object, then options
  return postFileImpl(path, {}, {}, fileBuffer, options);
};

export const uploadAsyncMethod = <S>(path: string, uri: string, options?: SimpleUploadAsyncOptions): Promise<S> => {
  return uploadAsyncImpl(path, uri, options);
};
