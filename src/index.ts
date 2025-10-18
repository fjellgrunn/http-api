export type { QueryParams } from "./types";
export * from "./errors";
export * from "./errors/FjellHttpError";
export * from "./api";
export * from "./api/deleteMethod";
export * from "./api/getMethod";
export * from "./api/http";
export * from "./api/postMethod";
export * from "./api/putMethod";
export * from "./api/optionsMethod";
export * from "./api/connectMethod";
export * from "./api/traceMethod";
export * from "./api/patchMethod";
export * from "./api/httpFile";
export * from "./api/postFileMethod";
export * from "./api/uploadAsyncMethod";

// Explicit exports for TypeScript resolution
export type {
  HttpApi,
  DeleteMethodOptions,
  GetMethodOptions,
  PostMethodOptions,
  PutMethodOptions,
  OptionsMethodOptions,
  ConnectMethodOptions,
  TraceMethodOptions,
  PatchMethodOptions,
} from "./api";

// Simple aliases for common use - pre-configured for easy usage
export { get, post, put, deleteMethod, postFileMethod, uploadAsyncMethod, options, connect, trace, patch } from "./simple-api";
