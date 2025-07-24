export type { QueryParams } from "./types";
export * from "./errors";
export * from "./api";
export * from "./api/deleteMethod";
export * from "./api/getMethod";
export * from "./api/http";
export * from "./api/postMethod";
export * from "./api/putMethod";
export * from "./api/httpFile";
export * from "./api/postFileMethod";
export * from "./api/uploadAsyncMethod";

// Explicit exports for TypeScript resolution
export type { HttpApi, DeleteMethodOptions, GetMethodOptions, PostMethodOptions, PutMethodOptions } from "./api";

// Simple aliases for common use - pre-configured for easy usage
export { get, post, put, deleteMethod, postFileMethod, uploadAsyncMethod } from "./simple-api";
