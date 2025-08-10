Your first HTTP API calls with Fjell HTTP API.

## Installation

```bash
npm install @fjell/http-api
```

Or with yarn:

```bash
yarn add @fjell/http-api
```

## Quick Start

The Fjell HTTP API provides simple methods for making HTTP requests with comprehensive error handling and response parsing.

### Basic GET Request

```typescript
import { get } from '@fjell/http-api';

// Simple GET request
const users = await get('https://api.example.com/users');
console.log(users);
```

### Basic POST Request

```typescript
import { post } from '@fjell/http-api';

// POST request with data
const newUser = await post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
console.log(newUser);
```

### Adding Headers

```typescript
import { get } from '@fjell/http-api';

// GET request with custom headers
const protectedData = await get('https://api.example.com/protected', {
  headers: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
  }
});
```

### Error Handling

```typescript
import { get } from '@fjell/http-api';

try {
  const data = await get('https://api.example.com/data');
  console.log(data);
} catch (error) {
  if (error.status === 404) {
    console.log('Resource not found');
  } else if (error.status >= 500) {
    console.log('Server error - retry later');
  } else {
    console.log('Request failed:', error.message);
  }
}
```

## Available Methods

The library provides the following HTTP methods:

- `get(url, options?)` - GET requests
- `post(url, data?, options?)` - POST requests
- `put(url, data?, options?)` - PUT requests
- `patch(url, data?, options?)` - PATCH requests
- `deleteMethod(url, options?)` - DELETE requests
- `options(url, options?)` - OPTIONS requests
- `connect(url, options?)` - CONNECT requests
- `trace(url, options?)` - TRACE requests
- `postFileMethod(url, file, options?)` - File uploads
- `uploadAsyncMethod(url, file, options?)` - Async file uploads with progress

## Configuration Options

All methods accept an options object with the following properties:

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | Date>;
  isAuthenticated?: boolean;
  requestCredentials?: RequestCredentials;
  isJson?: boolean;
  isJsonBody?: boolean;
  contentType?: string;
  accept?: string;
  skipContentType?: boolean;
}
```

### Examples with Options

```typescript
// Request with query parameters
const data = await get('https://api.example.com/search', {
  params: { q: 'fjell', page: 1 }
});

// Request with credentials
const userData = await get('https://api.example.com/user/profile', {
  requestCredentials: 'include',
  isAuthenticated: true
});

// Non-JSON request
const xmlData = await post('https://api.example.com/xml-endpoint', xmlPayload, {
  headers: {
    'Content-Type': 'application/xml'
  },
  isJson: false
});
```

## File Uploads

### Basic File Upload

```typescript
import { postFileMethod } from '@fjell/http-api';

const file = new File([fileData], 'document.pdf', { type: 'application/pdf' });
const result = await postFileMethod('https://api.example.com/upload', file);
```

### Async Upload with Progress

```typescript
import { uploadAsyncMethod } from '@fjell/http-api';

const result = await uploadAsyncMethod('https://api.example.com/upload-async', file, {
  onProgress: (progress) => console.log(`Upload progress: ${progress}%`)
});
```

## Next Steps

- Check out the [Examples](./examples/README.md) for comprehensive usage patterns
- Read the [API Reference](./API.md) for detailed method documentation
- Browse the source code examples in the `/examples` directory

## Common Patterns

### API Client Wrapper

Create a reusable API client for your application:

```typescript
import { get, post, put, deleteMethod } from '@fjell/http-api';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };

    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  async get(endpoint: string, options?: any) {
    return get(`${this.baseURL}${endpoint}`, {
      headers: this.defaultHeaders,
      ...options
    });
  }

  async post(endpoint: string, data?: any, options?: any) {
    return post(`${this.baseURL}${endpoint}`, data, {
      headers: this.defaultHeaders,
      ...options
    });
  }

  // Add other methods as needed...
}

// Usage
const api = new ApiClient('https://api.example.com', 'your-token');
const users = await api.get('/users');
```

That's it! You're ready to start making HTTP requests with Fjell HTTP API.
