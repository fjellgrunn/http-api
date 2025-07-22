/**
 * Error Handling Example
 *
 * This example demonstrates comprehensive error handling
 * with @fjell/http-api including retry logic, timeout handling,
 * and different error types.
 */

import { deleteMethod, get, post } from '@fjell/http-api';

// Mock API endpoints for demonstration
const API_BASE = 'https://api.example.com';
const UNRELIABLE_API = 'https://unreliable-api.example.com';

interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

async function basicErrorHandlingExample() {
  console.log('=== Basic Error Handling Example ===\n');

  // 404 Not Found Error
  try {
    console.log('1. Handling 404 Not Found...');
    await get(`${API_BASE}/nonexistent-resource`);
  } catch (error) {
    console.log(`Caught 404 error: ${error.message}`);
    console.log(`Status: ${error.status}`);
    console.log(`Error type: ${error.constructor.name}`);
  }

  // 401 Unauthorized Error
  try {
    console.log('\n2. Handling 401 Unauthorized...');
    await get(`${API_BASE}/protected-resource`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
  } catch (error) {
    console.log(`Caught 401 error: ${error.message}`);

    if (error.status === 401) {
      console.log('Token expired or invalid - redirect to login');
      // In a real app: redirectToLogin();
    }
  }

  // 403 Forbidden Error
  try {
    console.log('\n3. Handling 403 Forbidden...');
    await deleteMethod(`${API_BASE}/admin/users/1`, {
      headers: {
        'Authorization': 'Bearer user-token'
      }
    });
  } catch (error) {
    console.log(`Caught 403 error: ${error.message}`);

    if (error.status === 403) {
      console.log('Insufficient permissions for this action');
    }
  }

  // 400 Bad Request Error
  try {
    console.log('\n4. Handling 400 Bad Request...');
    await post(`${API_BASE}/users`, {
      // Missing required fields
      name: ''
    });
  } catch (error) {
    console.log(`Caught 400 error: ${error.message}`);

    if (error.status === 400) {
      console.log('Validation failed - check request data');
      // Parse error details if available
      if (error.response && error.response.errors) {
        console.log('Validation errors:', error.response.errors);
      }
    }
  }

  // 500 Internal Server Error
  try {
    console.log('\n5. Handling 500 Internal Server Error...');
    await get(`${API_BASE}/trigger-server-error`);
  } catch (error) {
    console.log(`Caught 500 error: ${error.message}`);

    if (error.status >= 500) {
      console.log('Server error - try again later');
    }
  }
}

async function retryLogicExample() {
  console.log('\n=== Retry Logic Example ===\n');

  const retryWithBackoff = async <T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1}/${options.maxRetries + 1}`);
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === options.maxRetries) {
          break;
        }

        // Only retry on certain error types
        if (error.status && error.status < 500 && error.status !== 429) {
          // Don't retry client errors (except rate limiting)
          throw error;
        }

        const delay = options.delayMs * Math.pow(options.backoffMultiplier, attempt);
        console.log(`Request failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };

  try {
    console.log('1. Retry with Exponential Backoff...');

    const result = await retryWithBackoff(
      () => get(`${UNRELIABLE_API}/unstable-endpoint`),
      {
        maxRetries: 3,
        delayMs: 1000,
        backoffMultiplier: 2
      }
    );

    console.log('Request succeeded after retries:', result);

  } catch (error) {
    console.log(`All retry attempts failed: ${error.message}`);
  }

  try {
    console.log('\n2. Retry with Rate Limit Handling...');

    const rateLimitedOperation = async () => {
      try {
        return await get(`${API_BASE}/rate-limited-endpoint`);
      } catch (error) {
        if (error.status === 429) {
          // Check Retry-After header
          const retryAfter = error.headers?.['retry-after'];
          if (retryAfter) {
            const waitTime = parseInt(retryAfter) * 1000;
            console.log(`Rate limited, waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return await get(`${API_BASE}/rate-limited-endpoint`);
          }
        }
        throw error;
      }
    };

    const rateLimitResult = await rateLimitedOperation();
    console.log('Rate limit handled successfully:', rateLimitResult);

  } catch (error) {
    console.log(`Rate limit handling failed: ${error.message}`);
  }
}

async function timeoutHandlingExample() {
  console.log('\n=== Timeout Handling Example ===\n');

  try {
    console.log('1. Request with Timeout...');

    // Simulate a request that might timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });

    const requestPromise = get(`${API_BASE}/slow-endpoint`);

    const result = await Promise.race([requestPromise, timeoutPromise]);
    console.log('Request completed within timeout:', result);

  } catch (error) {
    if (error.message === 'Request timeout') {
      console.log('Request timed out - server may be overloaded');
    } else {
      console.log(`Request failed: ${error.message}`);
    }
  }

  try {
    console.log('\n2. Graceful Timeout with Cleanup...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log('Request aborted due to timeout');
    }, 3000);

    try {
      const result = await get(`${API_BASE}/another-slow-endpoint`, {
        // Note: AbortController integration would need to be implemented in the HTTP client
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log('Request completed:', result);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.log(`Timeout handling failed: ${error.message}`);
  }
}

async function errorRecoveryExample() {
  console.log('\n=== Error Recovery Example ===\n');

  try {
    console.log('1. Fallback Strategy...');

    let userData;

    // Try primary data source
    try {
      userData = await get(`${API_BASE}/users/primary-source`);
      console.log('Data retrieved from primary source');
    } catch {
      console.log('Primary source failed, trying fallback...');

      // Try fallback data source
      try {
        userData = await get(`${API_BASE}/users/fallback-source`);
        console.log('Data retrieved from fallback source');
      } catch {
        console.log('Fallback also failed, using cache...');

        // Use cached data as last resort
        userData = await getCachedUserData();
        console.log('Using cached data');
      }
    }

    console.log('Final user data:', userData);

  } catch (error) {
    console.log(`All recovery strategies failed: ${(error as Error).message}`);
  }

  try {
    console.log('\n2. Circuit Breaker Pattern...');

    class CircuitBreaker {
      private failures = 0;
      private lastFailureTime = 0;
      private state: 'closed' | 'open' | 'half-open' = 'closed';

      constructor(
        private failureThreshold: number,
        private timeoutMs: number
      ) {}

      async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
          if (Date.now() - this.lastFailureTime < this.timeoutMs) {
            throw new Error('Circuit breaker is OPEN');
          } else {
            this.state = 'half-open';
          }
        }

        try {
          const result = await operation();
          this.onSuccess();
          return result;
        } catch (error) {
          this.onFailure();
          throw error;
        }
      }

      private onSuccess() {
        this.failures = 0;
        this.state = 'closed';
      }

      private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.failureThreshold) {
          this.state = 'open';
          console.log('Circuit breaker OPENED due to failures');
        }
      }
    }

    const circuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout

    for (let i = 0; i < 5; i++) {
      try {
        const result = await circuitBreaker.execute(() =>
          get(`${UNRELIABLE_API}/unreliable-service`)
        );
        console.log(`Request ${i + 1} succeeded:`, result);
      } catch (error) {
        console.log(`Request ${i + 1} failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`Circuit breaker example failed: ${error.message}`);
  }
}

async function errorLoggingExample() {
  console.log('\n=== Error Logging Example ===\n');

  const logError = (error: any, context: string) => {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      status: error.status,
      url: error.url,
      method: error.method,
      stack: error.stack,
      response: error.response
    };

    console.log('Error logged:', JSON.stringify(errorInfo, null, 2));

    // In a real application, send to logging service
    // logService.error(errorInfo);
  };

  try {
    console.log('1. Comprehensive Error Logging...');
    await get(`${API_BASE}/error-endpoint`);
  } catch (error) {
    logError(error, 'User profile fetch');
  }

  try {
    console.log('\n2. Error with Request Context...');
    await post(`${API_BASE}/create-resource`, { data: 'test' }, {
      headers: {
        'X-Request-ID': 'req-12345',
        'X-User-ID': 'user-789'
      }
    });
  } catch (error) {
    logError(error, 'Resource creation');

    // Add additional context for debugging
    console.log('Request context:', {
      requestId: 'req-12345',
      userId: 'user-789',
      timestamp: new Date().toISOString()
    });
  }
}

// Helper function to simulate cached data
async function getCachedUserData() {
  return {
    id: 1,
    name: 'Cached User',
    email: 'cached@example.com',
    source: 'cache'
  };
}

// Run all error handling examples
async function runErrorHandlingExamples() {
  await basicErrorHandlingExample();
  await retryLogicExample();
  await timeoutHandlingExample();
  await errorRecoveryExample();
  await errorLoggingExample();
}

if (require.main === module) {
  runErrorHandlingExamples().catch(console.error);
}

export {
  basicErrorHandlingExample,
  retryLogicExample,
  timeoutHandlingExample,
  errorRecoveryExample,
  errorLoggingExample
};
