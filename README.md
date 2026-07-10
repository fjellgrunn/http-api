# @fjell/http-api

A typed HTTP client library for the Fjell framework. It provides a simple, type-safe way to interact with REST APIs by making typed requests and receiving typed responses.

## Installation

```bash
npm install @fjell/http-api
```

Or with yarn:

```bash
yarn add @fjell/http-api
```

Or with pnpm:

```bash
pnpm add @fjell/http-api
```

## Quick Start

```typescript
import { getHttpApi } from '@fjell/http-api';

const api = getHttpApi({
  config: {
    url: 'https://api.example.com',
    requestCredentials: 'same-origin',
    clientName: 'my-app',
  },
  populateAuthHeader: async (isAuthenticated, headers) => {
    if (isAuthenticated) {
      headers['Authorization'] = 'Bearer your-token';
    }
  },
  uploadAsyncFile: async (destUrl, fileUri, method, uploadType, fieldName, headers) => {
    // Custom upload implementation
    return { headers: {}, status: 200, mimeType: null, body: '' };
  },
});

// Typed GET request
const users = await api.httpGet<User[]>('/users');

// Typed POST request
const created = await api.httpPost<User>('/users', { name: 'Alice', email: 'alice@example.com' });

// Typed PUT request
const updated = await api.httpPut<User>('/users/1', { name: 'Alice Smith' });

// Typed DELETE request
await api.httpDelete('/users/1');
```

## Simple Aliases

For convenience, pre-configured method aliases are also exported:

```typescript
import { get, post, put, deleteMethod } from '@fjell/http-api';
```

## Features

- **Type-safe requests and responses** — Full TypeScript generics for all HTTP methods.
- **Configurable** — Set base URLs, credentials, auth header population, and async file upload handlers.
- **Browser and Node.js support** — Works in both environments.
- **Error handling** — Structured `FjellHttpError` that preserves status codes and response data.
- **Multiple HTTP methods** — GET, POST, PUT, PATCH, DELETE, OPTIONS, CONNECT, TRACE.
- **File upload support** — Post files and async upload methods included.

## API Reference

### `getHttpApi(apiParams: ApiParams): HttpApi`

Creates a configured HTTP API instance.

#### `ApiParams`

| Field | Type | Description |
|-------|------|-------------|
| `config` | `ApiConfig` | Base configuration: `url`, `requestCredentials`, `clientName` |
| `populateAuthHeader` | `(isAuthenticated: boolean, headers: Record<string, string>) => Promise<void>` | Auth header population callback |
| `uploadAsyncFile` | `(destUrl, fileUri, method, uploadType, fieldName, headers) => Promise<...>` | Async file upload handler |

#### `HttpApi` Methods

| Method | Signature |
|--------|-----------|
| `httpGet` | `<S>(path: string, options?: Partial<GetMethodOptions>) => Promise<S>` |
| `httpPost` | `<S>(path: string, body?: any, options?: Partial<PostMethodOptions>) => Promise<S>` |
| `httpPut` | `<S>(path: string, body?: any, options?: Partial<PutMethodOptions>) => Promise<S>` |
| `httpPatch` | `<S>(path: string, body?: any, options?: Partial<PatchMethodOptions>) => Promise<S>` |
| `httpDelete` | `<S>(path: string, body?: any, options?: Partial<DeleteMethodOptions>) => Promise<S>` |
| `httpOptions` | `<S>(path: string, options?: Partial<OptionsMethodOptions>) => Promise<S>` |
| `httpConnect` | `<S>(path: string, options?: Partial<ConnectMethodOptions>) => Promise<S>` |
| `httpTrace` | `<S>(path: string, options?: Partial<TraceMethodOptions>) => Promise<S>` |
| `httpPostFile` | `<S>(path: string, body: any, headers: any, file: { buffer: Buffer; bufferName: string }, options?) => Promise<S>` |
| `uploadAsync` | `<S>(path: string, uri: string, options?: Partial<UploadAsyncMethodOptions>) => Promise<S>` |

## Contributing

This library is part of the [Fjell](https://github.com/fjellgrunn) project. To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -am 'Add my feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Open a pull request.

Please report bugs and suggest features via the [issue tracker](https://github.com/fjellgrunn/http-api/issues).

## License

Apache-2.0
