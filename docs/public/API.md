Complete method documentation for Fjell HTTP API.

## Core Methods

### `get(url: string, options?: RequestOptions): Promise<any>`

Performs a GET request to the specified URL.

**Parameters:**
- `url` (string): The URL to send the request to
- `options` (RequestOptions, optional): Request configuration options

**Returns:** Promise that resolves to the response data

**Example:**
```typescript
import { get } from '@fjell/http-api';

const users = await get('https://api.example.com/users');
const userById = await get('https://api.example.com/users/123');
```

### `post(url: string, data?: any, options?: RequestOptions): Promise<any>`

Performs a POST request to the specified URL with optional data.

**Parameters:**
- `url` (string): The URL to send the request to
- `data` (any, optional): The data to send in the request body
- `options` (RequestOptions, optional): Request configuration options

**Returns:** Promise that resolves to the response data

**Example:**
```typescript
import { post } from '@fjell/http-api';

const newUser = await post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### `put(url: string, data?: any, options?: RequestOptions): Promise<any>`

Performs a PUT request to the specified URL with optional data.

**Parameters:**
- `url` (string): The URL to send the request to
- `data` (any, optional): The data to send in the request body
- `options` (RequestOptions, optional): Request configuration options

**Returns:** Promise that resolves to the response data

**Example:**
```typescript
import { put } from '@fjell/http-api';

const updatedUser = await put('https://api.example.com/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

### `deleteMethod(url: string, options?: RequestOptions): Promise<any>`

Performs a DELETE request to the specified URL.

**Parameters:**
- `url` (string): The URL to send the request to
- `options` (RequestOptions, optional): Request configuration options

**Returns:** Promise that resolves to the response data

**Example:**
```typescript
import { deleteMethod } from '@fjell/http-api';

await deleteMethod('https://api.example.com/users/123');
```

## File Upload Methods

### `postFileMethod(url: string, file: File, options?: RequestOptions): Promise<any>`

Uploads a file using a POST request.

**Parameters:**
- `url` (string): The URL to upload the file to
- `file` (File): The file object to upload
- `options` (RequestOptions, optional): Request configuration options

**Returns:** Promise that resolves to the upload response

**Example:**
```typescript
import { postFileMethod } from '@fjell/http-api';

const file = new File([fileData], 'document.pdf', { type: 'application/pdf' });
const result = await postFileMethod('https://api.example.com/upload', file);
```

### `uploadAsyncMethod(url: string, file: File, options?: UploadOptions): Promise<any>`

Performs an asynchronous file upload with progress tracking.

**Parameters:**
- `url` (string): The URL to upload the file to
- `file` (File): The file object to upload
- `options` (UploadOptions, optional): Upload configuration options including progress callback

**Returns:** Promise that resolves to the upload response

**Example:**
```typescript
import { uploadAsyncMethod } from '@fjell/http-api';

const result = await uploadAsyncMethod('https://api.example.com/upload-async', file, {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
    updateProgressBar(progress);
  },
  headers: {
    'X-Upload-Source': 'web-app'
  }
});
```

## Configuration Interfaces

### `RequestOptions`

Configuration options for HTTP requests.

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  isAuthenticated?: boolean;
  requestCredentials?: RequestCredentials;
  isJson?: boolean;
  timeout?: number;
}
```

**Properties:**

- `headers` (object, optional): Custom HTTP headers to include with the request
- `isAuthenticated` (boolean, optional): Whether the request requires authentication
- `requestCredentials` (RequestCredentials, optional): Credentials mode for the request ('omit', 'same-origin', 'include')
- `isJson` (boolean, optional): Whether to parse the response as JSON (default: true)
- `timeout` (number, optional): Request timeout in milliseconds

### `UploadOptions`

Configuration options for file upload requests (extends RequestOptions).

```typescript
interface UploadOptions extends RequestOptions {
  onProgress?: (progress: number) => void;
  chunkSize?: number;
  resumable?: boolean;
}
```

**Additional Properties:**

- `onProgress` (function, optional): Callback function called with upload progress percentage
- `chunkSize` (number, optional): Size of chunks for chunked uploads
- `resumable` (boolean, optional): Whether the upload can be resumed if interrupted

## Error Handling

All methods throw errors that include additional information about the failed request:

```typescript
interface HttpError extends Error {
  status?: number;
  statusText?: string;
  url?: string;
  response?: any;
}
```

**Example error handling:**

```typescript
try {
  const data = await get('https://api.example.com/data');
} catch (error) {
  console.error('Request failed:', {
    status: error.status,
    statusText: error.statusText,
    url: error.url,
    message: error.message
  });

  // Handle specific error codes
  switch (error.status) {
    case 400:
      console.log('Bad request - check your data');
      break;
    case 401:
      console.log('Unauthorized - check your authentication');
      break;
    case 403:
      console.log('Forbidden - insufficient permissions');
      break;
    case 404:
      console.log('Not found - resource does not exist');
      break;
    case 429:
      console.log('Rate limited - slow down requests');
      break;
    case 500:
      console.log('Server error - try again later');
      break;
    default:
      console.log('Unknown error occurred');
  }
}
```

## Advanced Usage

### Custom Headers

```typescript
const response = await get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token',
    'X-API-Version': 'v2',
    'Accept': 'application/json',
    'User-Agent': 'MyApp/1.0'
  }
});
```

### Timeout Configuration

```typescript
// 5 second timeout
const data = await get('https://api.example.com/slow-endpoint', {
  timeout: 5000
});
```

### Non-JSON Responses

```typescript
// Handle XML response
const xmlData = await get('https://api.example.com/xml-data', {
  headers: {
    'Accept': 'application/xml'
  },
  isJson: false
});
```

### Credentials and CORS

```typescript
// Include cookies and credentials
const response = await get('https://api.example.com/protected', {
  requestCredentials: 'include',
  isAuthenticated: true
});
```

## Type Definitions

The library is written in TypeScript and provides full type definitions. You can import types for better development experience:

```typescript
import { RequestOptions, UploadOptions, HttpError } from '@fjell/http-api';
```

## Browser Compatibility

The library uses modern browser APIs including:

- Fetch API
- File API
- Promise API
- FormData API

Supported browsers:
- Chrome 42+
- Firefox 39+
- Safari 10.1+
- Edge 14+

For older browser support, consider using polyfills for the Fetch API.

## Best Practices

1. **Always handle errors**: Wrap requests in try-catch blocks
2. **Use timeouts**: Set appropriate timeouts for your use case
3. **Validate responses**: Check response structure before using data
4. **Cache tokens**: Store authentication tokens securely
5. **Use TypeScript**: Take advantage of type safety when available

## Migration Guide

If you're migrating from other HTTP libraries:

### From axios:
```typescript
// axios
const response = await axios.get('/api/data');
const data = response.data;

// fjell-http-api
const data = await get('/api/data');
```

### From fetch:
```typescript
// fetch
const response = await fetch('/api/data');
const data = await response.json();

// fjell-http-api
const data = await get('/api/data');
```

The Fjell HTTP API simplifies common patterns while maintaining flexibility for advanced use cases.
