/**
 * Advanced Configuration Example
 *
 * This example demonstrates advanced configuration options
 * with @fjell/http-api including custom headers, content types,
 * request credentials, and various HTTP options.
 */

import { get, post } from '@fjell/http-api';

// Mock API endpoints
const API_BASE = 'https://api.example.com';

async function customHeadersExample() {
  console.log('=== Custom Headers Example ===\n');

  try {
    // Request with custom headers
    console.log('1. Request with Custom Headers...');
    const response = await get(`${API_BASE}/users`, {
      headers: {
        'Accept': 'application/json',
        'X-API-Version': 'v1',
        'X-Client-ID': 'web-app',
        'X-Request-ID': `req-${Date.now()}`,
        'User-Agent': 'MyApp/1.0.0',
        'X-Correlation-ID': 'correlation-123'
      }
    });
    console.log('Response with custom headers:', response);

    // Request with conditional headers
    console.log('\n2. Conditional Headers...');
    const userAgent = 'MyApp/1.0.0';
    const sessionId = 'session-xyz';

    const conditionalHeaders: Record<string, string> = {
      'Accept': 'application/json'
    };

    if (userAgent) {
      conditionalHeaders['User-Agent'] = userAgent;
    }

    if (sessionId) {
      conditionalHeaders['X-Session-ID'] = sessionId;
    }

    const conditionalResponse = await get(`${API_BASE}/profile`, {
      headers: conditionalHeaders
    });
    console.log('Response with conditional headers:', conditionalResponse);

    // Headers with authentication
    console.log('\n3. Headers with Multiple Auth Methods...');
    const multiAuthResponse = await get(`${API_BASE}/secure-data`, {
      headers: {
        'Authorization': 'Bearer token-123',
        'X-API-Key': 'api-key-456',
        'X-Client-Cert': 'cert-fingerprint-789'
      },
      isAuthenticated: true
    });
    console.log('Multi-auth response:', multiAuthResponse);

  } catch (error) {
    console.error('Custom headers example failed:', error.message);
  }
}

async function contentTypeExample() {
  console.log('\n=== Content Type Example ===\n');

  try {
    // JSON content type (default)
    console.log('1. JSON Content Type...');
    const jsonData = {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    const jsonResponse = await post(`${API_BASE}/users`, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      },
      isJson: true,
      isJsonBody: true
    });
    console.log('JSON response:', jsonResponse);

    // Form data content type
    console.log('\n2. Form Data Content Type...');
    const formData = 'name=Jane+Doe&email=jane%40example.com&age=25';

    const formResponse = await post(`${API_BASE}/users/form`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      isJson: false,
      isJsonBody: false
    });
    console.log('Form response:', formResponse);

    // XML content type
    console.log('\n3. XML Content Type...');
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<user>
  <name>Bob Smith</name>
  <email>bob@example.com</email>
  <role>admin</role>
</user>`;

    const xmlResponse = await post(`${API_BASE}/users/xml`, xmlData, {
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      isJson: false,
      isJsonBody: false
    });
    console.log('XML response:', xmlResponse);

    // Custom content type
    console.log('\n4. Custom Content Type...');
    const customData = 'Custom payload format';

    const customResponse = await post(`${API_BASE}/custom-endpoint`, customData, {
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json'
      },
      isJson: false,
      skipContentType: false
    });
    console.log('Custom content type response:', customResponse);

  } catch (error) {
    console.error('Content type example failed:', error.message);
  }
}

async function requestCredentialsExample() {
  console.log('\n=== Request Credentials Example ===\n');

  try {
    // Include credentials (cookies, authorization headers)
    console.log('1. Include Credentials...');
    const includedResponse = await get(`${API_BASE}/user/session`, {
      requestCredentials: 'include'
    });
    console.log('Response with included credentials:', includedResponse);

    // Same-origin credentials only
    console.log('\n2. Same-Origin Credentials...');
    const sameOriginResponse = await get(`${API_BASE}/user/preferences`, {
      requestCredentials: 'same-origin'
    });
    console.log('Same-origin credentials response:', sameOriginResponse);

    // Omit credentials
    console.log('\n3. Omit Credentials...');
    const omitResponse = await get(`${API_BASE}/public/data`, {
      requestCredentials: 'omit'
    });
    console.log('Response with omitted credentials:', omitResponse);

    // Cross-origin with credentials
    console.log('\n4. Cross-Origin with Credentials...');
    const corsResponse = await post('https://cors-api.example.com/data', {
      message: 'Hello from CORS'
    }, {
      headers: {
        'Authorization': 'Bearer cors-token',
        'X-Requested-With': 'XMLHttpRequest'
      },
      requestCredentials: 'include'
    });
    console.log('CORS response:', corsResponse);

  } catch (error) {
    console.error('Request credentials example failed:', error.message);
  }
}

async function queryParametersExample() {
  console.log('\n=== Query Parameters Example ===\n');

  try {
    // Simple query parameters
    console.log('1. Simple Query Parameters...');
    const simpleParams = await get(`${API_BASE}/search`, {
      params: {
        q: 'typescript',
        limit: 10,
        offset: 0,
        sort: 'date'
      }
    });
    console.log('Simple params response:', simpleParams);

    // Complex query parameters
    console.log('\n2. Complex Query Parameters...');
    const complexParams = await get(`${API_BASE}/products`, {
      params: {
        category: 'electronics',
        'price[min]': 100,
        'price[max]': 500,
        'tags[]': 'new',
        available: true,
        date: new Date('2024-01-01')
      }
    });
    console.log('Complex params response:', complexParams);

    // Array parameters
    console.log('\n3. Array Parameters...');
    const arrayParams = await get(`${API_BASE}/filter`, {
      params: {
        'categories[]': ['tech', 'science', 'education'],
        'status[]': ['active', 'pending'],
        include_inactive: false
      }
    });
    console.log('Array params response:', arrayParams);

    // POST with query parameters
    console.log('\n4. POST with Query Parameters...');
    const postWithParams = await post(`${API_BASE}/process`, {
      data: 'processing request'
    }, {
      params: {
        async: true,
        priority: 'high',
        callback: 'https://myapp.com/webhook'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('POST with params response:', postWithParams);

  } catch (error) {
    console.error('Query parameters example failed:', error.message);
  }
}

async function responseHandlingExample() {
  console.log('\n=== Response Handling Example ===\n');

  try {
    // Handle different response formats
    console.log('1. JSON Response Handling...');
    const jsonResponse = await get(`${API_BASE}/data.json`, {
      accept: 'application/json',
      isJson: true
    });
    console.log('JSON response:', jsonResponse);

    // Handle text response
    console.log('\n2. Text Response Handling...');
    const textResponse = await get(`${API_BASE}/readme.txt`, {
      accept: 'text/plain',
      isJson: false
    });
    console.log('Text response:', textResponse);

    // Handle binary response
    console.log('\n3. Binary Response Handling...');
    const binaryResponse = await get(`${API_BASE}/download/file.pdf`, {
      accept: 'application/pdf',
      isJson: false
    });
    console.log('Binary response size:', binaryResponse.length || 'N/A');

    // Handle custom response format
    console.log('\n4. Custom Response Format...');
    const customResponse = await get(`${API_BASE}/data.xml`, {
      accept: 'application/xml',
      isJson: false
    });
    console.log('Custom response:', customResponse);

  } catch (error) {
    console.error('Response handling example failed:', error.message);
  }
}

async function advancedConfigurationExample() {
  console.log('\n=== Advanced Configuration Example ===\n');

  try {
    // Create a reusable configuration
    const apiConfig = {
      headers: {
        'Authorization': 'Bearer advanced-token',
        'X-API-Version': 'v2',
        'X-Client-Name': 'AdvancedClient'
      },
      isAuthenticated: true,
      requestCredentials: 'include' as RequestCredentials
    };

    console.log('1. Reusable Configuration...');
    const user = await get(`${API_BASE}/user/profile`, apiConfig);
    console.log('User profile:', user);

    // Override specific options
    console.log('\n2. Configuration Override...');
    const adminData = await get(`${API_BASE}/admin/stats`, {
      ...apiConfig,
      headers: {
        ...apiConfig.headers,
        'X-Admin-Access': 'true',
        'X-Scope': 'admin'
      }
    });
    console.log('Admin data:', adminData);

    // Configuration with custom processing
    console.log('\n3. Configuration with Processing...');
    const processedResponse = await post(`${API_BASE}/process-data`, {
      input: 'raw data',
      options: {
        format: 'processed',
        validate: true
      }
    }, {
      ...apiConfig,
      headers: {
        ...apiConfig.headers,
        'X-Processing-Mode': 'advanced',
        'X-Validation-Level': 'strict'
      },
      params: {
        async: false,
        return_metadata: true
      }
    });
    console.log('Processed response:', processedResponse);

  } catch (error) {
    console.error('Advanced configuration example failed:', error.message);
  }
}

// Environment-specific configuration
async function environmentConfigExample() {
  console.log('\n=== Environment Configuration Example ===\n');

  const getEnvironmentConfig = (env: 'development' | 'staging' | 'production') => {
    const baseConfigs = {
      development: {
        baseURL: 'http://localhost:3000/api',
        headers: {
          'X-Debug': 'true',
          'X-Environment': 'dev'
        }
      },
      staging: {
        baseURL: 'https://staging-api.example.com',
        headers: {
          'X-Environment': 'staging'
        }
      },
      production: {
        baseURL: 'https://api.example.com',
        headers: {
          'X-Environment': 'prod'
        }
      }
    };

    return baseConfigs[env];
  };

  try {
    const environment = 'development'; // This would come from process.env
    const config = getEnvironmentConfig(environment);

    console.log(`1. ${environment} Environment Configuration...`);
    const envResponse = await get(`${config.baseURL}/health`, {
      headers: config.headers
    });
    console.log('Environment response:', envResponse);

  } catch (error) {
    console.error('Environment configuration example failed:', error.message);
  }
}

// Run all advanced configuration examples
async function runAdvancedConfigurationExamples() {
  await customHeadersExample();
  await contentTypeExample();
  await requestCredentialsExample();
  await queryParametersExample();
  await responseHandlingExample();
  await advancedConfigurationExample();
  await environmentConfigExample();
}

if (require.main === module) {
  runAdvancedConfigurationExamples().catch(console.error);
}

export {
  customHeadersExample,
  contentTypeExample,
  requestCredentialsExample,
  queryParametersExample,
  responseHandlingExample,
  advancedConfigurationExample,
  environmentConfigExample
};
