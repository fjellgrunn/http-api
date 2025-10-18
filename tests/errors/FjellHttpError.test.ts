import { describe, expect, it } from 'vitest';
import { extractErrorInfo, FjellHttpError, isFjellHttpError } from '../../src/errors/FjellHttpError';
import { ErrorInfo } from '@fjell/core';

describe('FjellHttpError', () => {
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
      validOptions: ['user@example.com', 'test@example.com'],
      retryable: true
    },
    technical: {
      timestamp: '2025-10-18T14:00:00.000Z',
      requestId: 'req-123'
    }
  };

  const mockRequestInfo = {
    method: 'POST',
    url: 'http://api.example.com/users',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'invalid', name: 'John' }
  };

  describe('Constructor and basic properties', () => {
    it('should create error with all properties', () => {
      const error = new FjellHttpError(
        'Validation failed',
        mockErrorInfo,
        400,
        mockRequestInfo
      );

      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('FjellHttpError');
      expect(error.fjellError).toEqual(mockErrorInfo);
      expect(error.httpResponseCode).toBe(400);
      expect(error.requestInfo).toEqual(mockRequestInfo);
    });

    it('should work without request info', () => {
      const error = new FjellHttpError(
        'Error message',
        mockErrorInfo,
        400
      );

      expect(error.message).toBe('Error message');
      expect(error.requestInfo).toBeUndefined();
    });

    it('should have proper prototype chain', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      
      expect(error).toBeInstanceOf(FjellHttpError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('getUserMessage()', () => {
    it('should return basic error message', () => {
      const error = new FjellHttpError(
        'Test',
        {
          ...mockErrorInfo,
          details: void 0
        },
        400
      );

      expect(error.getUserMessage()).toBe('Invalid email format');
    });

    it('should include parent location context', () => {
      const error = new FjellHttpError(
        'Test',
        {
          ...mockErrorInfo,
          context: {
            ...mockErrorInfo.context,
            parentLocation: { id: 123, type: 'company' }
          }
        },
        400
      );

      const message = error.getUserMessage();
      expect(message).toContain('Invalid email format');
      expect(message).toContain('(in company #123)');
    });

    it('should include suggested action', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);

      const message = error.getUserMessage();
      expect(message).toContain('Invalid email format');
      expect(message).toContain('Use a valid email format');
    });

    it('should include valid options', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);

      const message = error.getUserMessage();
      expect(message).toContain('Invalid email format');
      expect(message).toContain('Valid options: user@example.com, test@example.com');
    });

    it('should include all contextual information', () => {
      const error = new FjellHttpError(
        'Test',
        {
          ...mockErrorInfo,
          context: {
            ...mockErrorInfo.context,
            parentLocation: { id: 456, type: 'department' }
          }
        },
        400
      );

      const message = error.getUserMessage();
      expect(message).toContain('Invalid email format');
      expect(message).toContain('(in department #456)');
      expect(message).toContain('Use a valid email format');
      expect(message).toContain('Valid options: user@example.com, test@example.com');
    });
  });

  describe('isRetryable()', () => {
    it('should return true when retryable is true', () => {
      const error = new FjellHttpError(
        'Test',
        {
          ...mockErrorInfo,
          details: { retryable: true }
        },
        400
      );

      expect(error.isRetryable()).toBe(true);
    });

    it('should return false when retryable is false', () => {
      const error = new FjellHttpError(
        'Test',
        {
          ...mockErrorInfo,
          details: { retryable: false }
        },
        400
      );

      expect(error.isRetryable()).toBe(false);
    });

    it('should return false when retryable is not specified', () => {
      const error = new FjellHttpError(
        'Test',
        {
          ...mockErrorInfo,
          details: void 0
        },
        400
      );

      expect(error.isRetryable()).toBe(false);
    });
  });

  describe('getCode()', () => {
    it('should return error code', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      expect(error.getCode()).toBe('VALIDATION_ERROR');
    });
  });

  describe('toJSON()', () => {
    it('should serialize to JSON', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400, mockRequestInfo);
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'FjellHttpError',
        message: 'Test',
        fjellError: mockErrorInfo,
        httpResponseCode: 400,
        requestInfo: mockRequestInfo
      });
    });

    it('should work without request info', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      const json = error.toJSON();

      expect(json.requestInfo).toBeUndefined();
    });
  });

  describe('isFjellHttpError()', () => {
    it('should return true for FjellHttpError', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      expect(isFjellHttpError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isFjellHttpError(error)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isFjellHttpError(null)).toBe(false);
      expect(isFjellHttpError(void 0)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isFjellHttpError({})).toBe(false);
      expect(isFjellHttpError({ message: 'test' })).toBe(false);
    });
  });

  describe('extractErrorInfo()', () => {
    it('should extract from FjellHttpError', () => {
      const error = new FjellHttpError('Test', mockErrorInfo, 400);
      const extracted = extractErrorInfo(error);

      expect(extracted).toEqual(mockErrorInfo);
    });

    it('should extract from object with fjellError property', () => {
      const errorObj = {
        message: 'Test',
        fjellError: mockErrorInfo
      };

      const extracted = extractErrorInfo(errorObj);
      expect(extracted).toEqual(mockErrorInfo);
    });

    it('should return null for regular Error', () => {
      const error = new Error('Test');
      const extracted = extractErrorInfo(error);

      expect(extracted).toBeNull();
    });

    it('should return null for objects without fjellError', () => {
      const extracted = extractErrorInfo({ message: 'test' });
      expect(extracted).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(extractErrorInfo(null)).toBeNull();
      expect(extractErrorInfo(void 0)).toBeNull();
    });
  });
});

