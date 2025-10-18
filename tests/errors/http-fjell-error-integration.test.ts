import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHttp } from '../../src/api/http';
import { type ErrorInfo, extractErrorInfo, FjellHttpError, isFjellHttpError } from '../../src/errors/FjellHttpError';

describe('HTTP Client Fjell Error Integration', () => {
  const mockApiParams = {
    config: {
      url: 'http://api.example.com',
      requestCredentials: 'include' as RequestCredentials,
      clientName: 'test-client'
    },
    populateAuthHeader: vi.fn().mockResolvedValue(void 0),
    uploadAsyncFile: vi.fn()
  };

  const mockErrorInfo: ErrorInfo = {
    code: 'VALIDATION_ERROR',
    message: 'Invalid email format',
    operation: {
      type: 'create',
      name: 'create',
      params: { email: 'invalid' }
    },
    context: {
      itemType: 'user'
    },
    details: {
      suggestedAction: 'Use a valid email format',
      validOptions: ['user@example.com'],
      retryable: true
    },
    technical: {
      timestamp: '2025-10-18T14:00:00.000Z',
      requestId: 'req-123'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Structured Fjell error responses', () => {
    it('should parse and throw FjellHttpError for structured error response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({
          success: false,
          error: mockErrorInfo
        })
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);

      try {
        await http('POST', '/users', { email: 'invalid' }, { isJson: true });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(FjellHttpError);
        expect(error.fjellError).toEqual(mockErrorInfo);
        expect(error.httpResponseCode).toBe(400);
        expect(error.message).toBe('Invalid email format');
        expect(error.requestInfo).toBeDefined();
        expect(error.requestInfo?.method).toBe('POST');
        expect(error.requestInfo?.url).toContain('/users');
      }
    });

    it('should parse NotFoundError from server', async () => {
      const notFoundError: ErrorInfo = {
        code: 'NOT_FOUND',
        message: 'user not found',
        operation: {
          type: 'get',
          name: 'get',
          params: { key: { pk: 123, kt: 'user' } }
        },
        context: {
          itemType: 'user',
          key: { primary: 123 }
        },
        details: {
          retryable: false
        },
        technical: {
          timestamp: '2025-10-18T14:00:00.000Z',
          requestId: 'req-456'
        }
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({
          success: false,
          error: notFoundError
        })
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);

      try {
        await http('GET', '/users/123', null, { isJson: true });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(FjellHttpError);
        expect(error.getCode()).toBe('NOT_FOUND');
        expect(error.isRetryable()).toBe(false);
        expect(error.httpResponseCode).toBe(404);
      }
    });

    it('should parse DuplicateError from server', async () => {
      const duplicateError: ErrorInfo = {
        code: 'DUPLICATE_ERROR',
        message: 'user already exists',
        operation: {
          type: 'create',
          name: 'create',
          params: { email: 'john@example.com' }
        },
        context: {
          itemType: 'user'
        },
        details: {
          conflictingValue: 'email'
        },
        technical: {
          timestamp: '2025-10-18T14:00:00.000Z'
        }
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        text: async () => JSON.stringify({
          success: false,
          error: duplicateError
        })
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);

      try {
        await http('POST', '/users', { email: 'john@example.com' }, { isJson: true });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(FjellHttpError);
        expect(error.getCode()).toBe('DUPLICATE_ERROR');
        expect(error.fjellError.details?.conflictingValue).toBe('email');
      }
    });
  });

  describe('Legacy error responses', () => {
    it('should fallback to legacy errors for non-structured responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Not found'
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);

      try {
        await http('GET', '/users/123', null, { isJson: false });
        expect.fail('Should have thrown');
      } catch (error: any) {
        // Should throw legacy error, not FjellHttpError
        expect(error).not.toBeInstanceOf(FjellHttpError);
        // Legacy errors throw Error, not specific error classes anymore
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should fallback for non-JSON error responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error occurred'
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);

      try {
        await http('GET', '/test', null, { isJson: true });
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error).not.toBeInstanceOf(FjellHttpError);
        // Legacy errors are still thrown for non-structured responses
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Success responses', () => {
    it('should unwrap structured success responses', async () => {
      const mockData = { id: 123, name: 'John Doe' };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          success: true,
          data: mockData
        })
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);
      const result = await http('GET', '/users/123', null, { isJson: true });

      expect(result).toEqual(mockData);
    });

    it('should handle legacy success responses without wrapper', async () => {
      const mockData = { id: 123, name: 'John Doe' };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockData)
      });

      global.fetch = mockFetch;

      const http = getHttp(mockApiParams);
      const result = await http('GET', '/users/123', null, { isJson: true });

      expect(result).toEqual(mockData);
    });
  });

  describe('isFjellHttpError type guard', () => {
    it('should return true for FjellHttpError', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      expect(isFjellHttpError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isFjellHttpError(error)).toBe(false);
    });

    it('should return false for other error types', () => {
      const error = new TypeError('Test');
      expect(isFjellHttpError(error)).toBe(false);
    });
  });

  describe('extractErrorInfo helper', () => {
    it('should extract from FjellHttpError', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      const info = extractErrorInfo(error);

      expect(info).toEqual(mockErrorInfo);
    });

    it('should extract from objects with fjellError property', () => {
      const obj = {
        message: 'Test',
        fjellError: mockErrorInfo
      };

      const info = extractErrorInfo(obj);
      expect(info).toEqual(mockErrorInfo);
    });

    it('should return null for regular errors', () => {
      const error = new Error('Test');
      const info = extractErrorInfo(error);

      expect(info).toBeNull();
    });
  });
});

