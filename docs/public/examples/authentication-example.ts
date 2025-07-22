/**
 * Authentication Example
 *
 * This example demonstrates various authentication patterns
 * with @fjell/http-api including API keys, bearer tokens,
 * and custom authentication methods.
 */

import { get, post, put } from '@fjell/http-api';

// Mock API endpoints for demonstration
const PROTECTED_API = 'https://api.example.com';
const API_KEY = 'your-api-key-here';
const BEARER_TOKEN = 'your-bearer-token-here';

async function apiKeyAuthenticationExample() {
  console.log('=== API Key Authentication Example ===\n');

  try {
    // Using API key in headers
    console.log('1. API Key in Headers...');
    const response = await get(`${PROTECTED_API}/profile`, {
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('Profile data:', response);

    // Using API key as query parameter
    console.log('\n2. API Key as Query Parameter...');
    const data = await get(`${PROTECTED_API}/dashboard`, {
      params: {
        api_key: API_KEY,
        format: 'json'
      }
    });
    console.log('Dashboard data:', data);

  } catch (error) {
    console.error('API Key authentication failed:', error.message);
  }
}

async function bearerTokenAuthenticationExample() {
  console.log('\n=== Bearer Token Authentication Example ===\n');

  try {
    // Standard Bearer token authentication
    console.log('1. Bearer Token Authentication...');
    const userProfile = await get(`${PROTECTED_API}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Accept': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('User profile:', userProfile);

    // Creating protected resources with Bearer token
    console.log('\n2. Creating Protected Resource...');
    const newResource = {
      name: 'Sensitive Document',
      content: 'This is protected content',
      classification: 'confidential'
    };

    const createdResource = await post(`${PROTECTED_API}/documents`, newResource, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('Created protected resource:', createdResource);

    // Updating with authorization
    console.log('\n3. Updating Protected Resource...');
    const updatedResource = await put(`${PROTECTED_API}/documents/123`, {
      ...newResource,
      name: 'Updated Sensitive Document'
    }, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('Updated resource:', updatedResource);

  } catch (error) {
    console.error('Bearer token authentication failed:', error.message);
  }
}

async function customAuthenticationExample() {
  console.log('\n=== Custom Authentication Example ===\n');

  try {
    // JWT token with custom header
    console.log('1. JWT Token with Custom Header...');
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    const jwtResponse = await get(`${PROTECTED_API}/admin/users`, {
      headers: {
        'X-JWT-Token': jwtToken,
        'X-Client-ID': 'web-app-v1',
        'Accept': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('Admin users:', jwtResponse);

    // HMAC signature authentication
    console.log('\n2. HMAC Signature Authentication...');
    const timestamp = Date.now().toString();
    const signature = 'calculated-hmac-signature'; // In real implementation, calculate HMAC

    const hmacResponse = await get(`${PROTECTED_API}/secure-data`, {
      headers: {
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        'X-Client-ID': 'secure-client',
        'Accept': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('Secure data:', hmacResponse);

    // OAuth 2.0 style authentication
    console.log('\n3. OAuth 2.0 Style Authentication...');
    const oauthToken = 'oauth2-access-token';
    const oauthResponse = await post(`${PROTECTED_API}/oauth/resource`, {
      action: 'read',
      resource_id: '12345'
    }, {
      headers: {
        'Authorization': `OAuth ${oauthToken}`,
        'X-OAuth-Scope': 'read write',
        'Content-Type': 'application/json'
      },
      isAuthenticated: true
    });
    console.log('OAuth resource:', oauthResponse);

  } catch (error) {
    console.error('Custom authentication failed:', error.message);
  }
}

async function sessionBasedAuthenticationExample() {
  console.log('\n=== Session-Based Authentication Example ===\n');

  try {
    // Login to get session cookie
    console.log('1. Logging in to get session...');
    const loginResponse = await post(`${PROTECTED_API}/auth/login`, {
      username: 'user@example.com',
      password: 'secure-password'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      requestCredentials: 'include' // Include cookies
    });
    console.log('Login response:', loginResponse);

    // Making authenticated requests with session
    console.log('\n2. Making authenticated requests with session...');
    const sessionResponse = await get(`${PROTECTED_API}/user/settings`, {
      requestCredentials: 'include', // Send cookies with request
      isAuthenticated: true
    });
    console.log('User settings:', sessionResponse);

    // Logout
    console.log('\n3. Logging out...');
    await post(`${PROTECTED_API}/auth/logout`, {}, {
      requestCredentials: 'include'
    });
    console.log('Logged out successfully');

  } catch (error) {
    console.error('Session authentication failed:', error.message);
  }
}

// Helper function to refresh tokens
async function refreshTokenExample() {
  console.log('\n=== Token Refresh Example ===\n');

  try {
    const refreshToken = 'your-refresh-token';

    console.log('Refreshing access token...');
    const tokenResponse = await post(`${PROTECTED_API}/auth/refresh`, {
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('New tokens:', tokenResponse);

    // Use the new access token for subsequent requests
    const newAccessToken = tokenResponse.access_token;
    const protectedData = await get(`${PROTECTED_API}/protected-endpoint`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      },
      isAuthenticated: true
    });

    console.log('Protected data with refreshed token:', protectedData);

  } catch (error) {
    console.error('Token refresh failed:', error.message);
  }
}

// Run all authentication examples
async function runAuthenticationExamples() {
  await apiKeyAuthenticationExample();
  await bearerTokenAuthenticationExample();
  await customAuthenticationExample();
  await sessionBasedAuthenticationExample();
  await refreshTokenExample();
}

if (require.main === module) {
  runAuthenticationExamples().catch(console.error);
}

export {
  apiKeyAuthenticationExample,
  bearerTokenAuthenticationExample,
  customAuthenticationExample,
  sessionBasedAuthenticationExample,
  refreshTokenExample
};
