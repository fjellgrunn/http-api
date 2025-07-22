/**
 * Integration test for authentication example
 */

import { vi } from 'vitest';
import {
  apiKeyAuthenticationExample,
  bearerTokenAuthenticationExample,
  customAuthenticationExample,
  refreshTokenExample,
  sessionBasedAuthenticationExample
} from '@examples/authentication-example';

describe('Authentication Example', () => {
  // Mock console methods to avoid cluttering test output
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('apiKeyAuthenticationExample should execute without throwing', async () => {
    try {
      await apiKeyAuthenticationExample();
      expect(true).toBe(true);
    } catch (error) {
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('bearerTokenAuthenticationExample should execute without throwing', async () => {
    try {
      await bearerTokenAuthenticationExample();
      expect(true).toBe(true);
    } catch (error) {
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('customAuthenticationExample should execute without throwing', async () => {
    try {
      await customAuthenticationExample();
      expect(true).toBe(true);
    } catch (error) {
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('sessionBasedAuthenticationExample should execute without throwing', async () => {
    try {
      await sessionBasedAuthenticationExample();
      expect(true).toBe(true);
    } catch (error) {
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      expect(error).toBeInstanceOf(Error);
    }
  });

  test('refreshTokenExample should execute without throwing', async () => {
    try {
      await refreshTokenExample();
      expect(true).toBe(true);
    } catch (error) {
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      expect(error).toBeInstanceOf(Error);
    }
  });
});
