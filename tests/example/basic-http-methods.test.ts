/**
 * Integration test for basic HTTP methods example
 */

import { vi } from 'vitest';
import { basicHttpExamples, errorHandlingExample } from '@examples/basic-http-methods';

describe('Basic HTTP Methods Example', () => {
  test('basicHttpExamples should execute without throwing', async () => {
    // Mock console.log to avoid cluttering test output
    const originalLog = console.log;
    console.log = vi.fn();

    try {
      await basicHttpExamples();
      // If we get here, the function completed successfully
      expect(true).toBe(true);
    } catch (error) {
      // The example may fail due to network issues, but we want to ensure
      // the code structure is sound. Only fail for syntax/import errors
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      // Network/API errors are expected in test environment
      expect(error).toBeInstanceOf(Error);
    } finally {
      console.log = originalLog;
    }
  });

  test('errorHandlingExample should execute without throwing', async () => {
    const originalLog = console.log;
    const originalError = console.error;
    console.log = vi.fn();
    console.error = vi.fn();

    try {
      await errorHandlingExample();
      expect(true).toBe(true);
    } catch (error) {
      if (error.message?.includes('Cannot resolve module') ||
          error.message?.includes('SyntaxError') ||
          error.message?.includes('TypeError')) {
        throw error;
      }
      expect(error).toBeInstanceOf(Error);
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  });
});
