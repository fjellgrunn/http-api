This directory contains comprehensive examples demonstrating the capabilities of @fjell/http-api. Each example focuses on specific functionality and use cases to help you understand and implement HTTP operations in your applications.

## Getting Started

To run any of these examples:

1. Install the package dependencies:
   ```bash
   npm install @fjell/http-api
   ```

2. Run individual examples:
   ```bash
   npx ts-node examples/basic-http-methods.ts
   npx ts-node examples/authentication-example.ts
   # ... or any other example
   ```

## Available Examples

### 1. Basic HTTP Methods (`basic-http-methods.ts`)

**Purpose**: Demonstrates fundamental HTTP operations (GET, POST, PUT, DELETE) with various configuration options.

**What you'll learn**:
- Making basic HTTP requests
- Using query parameters
- Custom headers and configuration
- Basic error handling patterns

**Key features demonstrated**:
- GET requests with and without parameters
- POST requests for creating resources
- PUT requests for updating resources
- DELETE requests for removing resources
- Custom headers and request options

**Example usage**:
```typescript
import { get, post, put, deleteMethod } from '@fjell/http-api';

// Simple GET request
const users = await get('https://api.example.com/users');

// POST with data
const newUser = await post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

### 2. Authentication (`authentication-example.ts`)

**Purpose**: Covers various authentication patterns including API keys, bearer tokens, custom authentication methods, and session-based authentication.

**What you'll learn**:
- API key authentication (headers and query parameters)
- Bearer token authentication
- Custom authentication headers (JWT, HMAC, OAuth)
- Session-based authentication with cookies
- Token refresh mechanisms

**Key features demonstrated**:
- Multiple authentication strategies
- Credential management
- Token refresh workflows
- Cross-origin authentication

**Example usage**:
```typescript
// Bearer token authentication
const response = await get('https://api.example.com/protected', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  },
  isAuthenticated: true
});

// API key in headers
const data = await get('https://api.example.com/data', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});
```

### 3. File Upload (`file-upload-example.ts`)

**Purpose**: Comprehensive file upload examples including basic uploads, async uploads, progress tracking, and various upload patterns.

**What you'll learn**:
- Basic file uploads with postFileMethod
- Async file uploads with progress tracking
- Multiple file uploads (batch processing)
- Resumable uploads for large files
- File validation before and after upload

**Key features demonstrated**:
- Single and multiple file uploads
- Progress tracking callbacks
- Chunked upload strategies
- Upload validation and error handling
- Resumable upload sessions

**Example usage**:
```typescript
import { postFileMethod, uploadAsyncMethod } from '@fjell/http-api';

// Basic file upload
const file = new File([fileData], 'document.pdf', { type: 'application/pdf' });
const result = await postFileMethod('https://api.example.com/upload', file);

// Async upload with progress
const asyncResult = await uploadAsyncMethod('https://api.example.com/upload-async', file, {
  onProgress: (progress) => console.log(`Progress: ${progress}%`)
});
```

### 4. Error Handling (`error-handling-example.ts`)

**Purpose**: Demonstrates comprehensive error handling strategies including retry logic, timeout handling, circuit breaker patterns, and error recovery mechanisms.

**What you'll learn**:
- Handling different HTTP error codes (404, 401, 403, 400, 500)
- Implementing retry logic with exponential backoff
- Timeout handling and request abortion
- Fallback strategies and circuit breaker patterns
- Error logging and debugging techniques

**Key features demonstrated**:
- Status-code specific error handling
- Retry mechanisms with backoff strategies
- Rate limiting and retry-after handling
- Fallback data sources
- Comprehensive error logging

**Example usage**:
```typescript
// Basic error handling
try {
  const data = await get('https://api.example.com/data');
} catch (error) {
  if (error.status === 404) {
    console.log('Resource not found');
  } else if (error.status >= 500) {
    console.log('Server error - retry later');
  }
}

// Retry with backoff
const retryWithBackoff = async (operation, maxRetries = 3) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

### 5. Advanced Configuration (`advanced-configuration-example.ts`)

**Purpose**: Explores advanced configuration options including custom headers, content types, request credentials, query parameters, and environment-specific configurations.

**What you'll learn**:
- Custom header management
- Different content types (JSON, XML, form data)
- Request credentials and CORS handling
- Complex query parameter structures
- Environment-specific configuration
- Response format handling

**Key features demonstrated**:
- Dynamic header construction
- Content-Type and Accept header management
- CORS and credential handling
- Complex parameter encoding
- Environment-based configuration
- Response format negotiation

**Example usage**:
```typescript
// Custom headers and content type
const response = await post('https://api.example.com/data', xmlData, {
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml',
    'X-API-Version': 'v2'
  },
  isJson: false
});

// Environment-specific configuration
const config = getEnvironmentConfig(process.env.NODE_ENV);
const result = await get(`${config.baseURL}/health`, {
  headers: config.headers
});
```

## Common Patterns and Best Practices

### Configuration Management

Create reusable configuration objects for consistent API interactions:

```typescript
const apiConfig = {
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  isAuthenticated: true,
  requestCredentials: 'include'
};

// Use across multiple requests
const user = await get('/user/profile', apiConfig);
const settings = await get('/user/settings', apiConfig);
```

### Error Handling Strategy

Implement a consistent error handling strategy:

```typescript
const handleApiError = (error: any, context: string) => {
  console.error(`API Error in ${context}:`, {
    status: error.status,
    message: error.message,
    url: error.url
  });

  // Implement specific error handling logic
  switch (error.status) {
    case 401:
      // Handle authentication errors
      break;
    case 403:
      // Handle permission errors
      break;
    case 429:
      // Handle rate limiting
      break;
    default:
      // Handle other errors
  }
};
```

### Request Interceptors Pattern

While not built-in, you can create wrapper functions for common request modifications:

```typescript
const authenticatedRequest = async (method: Function, url: string, data?: any, options?: any) => {
  const token = getAuthToken();
  return method(url, data, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options?.headers
    },
    isAuthenticated: true
  });
};

// Usage
const userData = await authenticatedRequest(get, '/user/profile');
```

## Testing Examples

Each example includes error simulation and edge cases. To test with real APIs:

1. Replace mock endpoints with actual API URLs
2. Update authentication tokens and API keys
3. Modify data structures to match your API schema
4. Adjust error handling based on your API's error format

## TypeScript Support

All examples are written in TypeScript and demonstrate:
- Type-safe request/response handling
- Interface definitions for API responses
- Generic type parameters for flexible usage
- Proper error type handling

## Dependencies

These examples require:
- `@fjell/http-api` - The main HTTP client library
- `typescript` - For TypeScript compilation
- `ts-node` - For running TypeScript files directly (development)

## Additional Resources

- [Fjell HTTP API Documentation](../docs/)
- [API Reference](../docs/api-reference.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [GitHub Repository](https://github.com/getfjell/fjell-http-api)

## Running All Examples

To run all examples sequentially:

```bash
npm run examples
```

Or run them individually:

```bash
npx ts-node examples/basic-http-methods.ts
npx ts-node examples/authentication-example.ts
npx ts-node examples/file-upload-example.ts
npx ts-node examples/error-handling-example.ts
npx ts-node examples/advanced-configuration-example.ts
```

## Contributing

If you have additional example use cases or improvements to existing examples, please:

1. Follow the existing code style and documentation patterns
2. Include comprehensive comments and error handling
3. Add appropriate TypeScript types
4. Update this README with your new example
5. Submit a pull request with a clear description

Built with intention for the Fjell ecosystem.
