/**
 * Basic HTTP Methods Example
 *
 * This example demonstrates how to use the core HTTP methods
 * provided by @fjell/http-api for basic CRUD operations.
 */

import {
  deleteMethod,
  get,
  post,
  put
} from '@fjell/http-api';

// Example API base URL
const API_BASE = 'https://jsonplaceholder.typicode.com';

interface User {
  id?: number;
  name: string;
  email: string;
  username: string;
}

interface Post {
  id?: number;
  title: string;
  body: string;
  userId: number;
}

async function basicHttpExamples() {
  console.log('=== Basic HTTP Methods Example ===\n');

  try {
    // GET: Fetch all users
    console.log('1. GET Request - Fetching users...');
    const users = await get(`${API_BASE}/users`);
    console.log(`Retrieved ${users.length} users`);
    console.log('First user:', users[0]);

    // GET: Fetch a specific user with query parameters
    console.log('\n2. GET Request with Query Parameters...');
    const filteredUsers = await get(`${API_BASE}/users`, {
      params: {
        username: 'Bret'
      }
    });
    console.log('Filtered users:', filteredUsers);

    // POST: Create a new user
    console.log('\n3. POST Request - Creating new user...');
    const newUser: User = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      username: 'johndoe'
    };

    const createdUser = await post(`${API_BASE}/users`, newUser);
    console.log('Created user:', createdUser);

    // PUT: Update an existing user
    console.log('\n4. PUT Request - Updating user...');
    const updatedUserData: User = {
      id: 1,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      username: 'janesmith'
    };

    const updatedUser = await put(`${API_BASE}/users/1`, updatedUserData);
    console.log('Updated user:', updatedUser);

    // DELETE: Remove a user
    console.log('\n5. DELETE Request - Removing user...');
    await deleteMethod(`${API_BASE}/users/1`);
    console.log('User deleted successfully');

    // POST with custom headers and options
    console.log('\n6. POST with Custom Configuration...');
    const newPost: Post = {
      title: 'My New Post',
      body: 'This is the content of my new post.',
      userId: 1
    };

    const createdPost = await post(`${API_BASE}/posts`, newPost, {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value'
      },
      accept: 'application/json',
      isJson: true
    });
    console.log('Created post with custom headers:', createdPost);

  } catch (error) {
    console.error('HTTP request failed:', error);
  }
}

// Example with error handling
async function errorHandlingExample() {
  console.log('\n=== Error Handling Example ===\n');

  try {
    // This will likely result in a 404 error
    await get(`${API_BASE}/nonexistent-endpoint`);
  } catch (error) {
    console.log('Caught expected error:', error.message);
    console.log('Error type:', error.constructor.name);
  }

  try {
    // Invalid data that might cause a 400 error
    await post(`${API_BASE}/posts`, { invalid: 'data' });
  } catch (error) {
    console.log('Caught validation error:', error.message);
  }
}

// Run the examples
async function runExamples() {
  await basicHttpExamples();
  await errorHandlingExample();
}

if (require.main === module) {
  runExamples().catch(console.error);
}

export { basicHttpExamples, errorHandlingExample };
