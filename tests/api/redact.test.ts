import { describe, expect, it } from 'vitest';
import { redactBody, REDACTED, redactHeaders, sanitizeRequestInfo } from '../../src/api/redact';
import { FjellHttpError } from '../../src/errors/FjellHttpError';

describe('redactHeaders', () => {
  it('redacts Authorization and Cookie headers', () => {
    const result = redactHeaders({
      Authorization: 'Bearer secret-token',
      Cookie: 'session=abc',
      'Content-Type': 'application/json',
      'X-Api-Key': 'key-123',
    });

    expect(result).toEqual({
      Authorization: REDACTED,
      Cookie: REDACTED,
      'Content-Type': 'application/json',
      'X-Api-Key': REDACTED,
    });
  });
});

describe('redactBody', () => {
  it('redacts sensitive fields and truncates long strings', () => {
    expect(redactBody({
      email: 'a@b.com',
      password: 'hunter2',
      token: 'abc',
    })).toEqual({
      email: 'a@b.com',
      password: REDACTED,
      token: REDACTED,
    });
  });
});

describe('sanitizeRequestInfo / FjellHttpError', () => {
  it('redacts auth headers on FjellHttpError.requestInfo and toJSON()', () => {
    const error = new FjellHttpError(
      'fail',
      {
        code: 'X',
        message: 'fail',
        operation: { type: 'get', name: 'get', params: {} },
        context: { itemType: 'user' },
      },
      401,
      {
        method: 'GET',
        url: 'http://example.com/x',
        headers: {
          Authorization: 'Bearer top-secret',
          Accept: 'application/json',
        },
        body: { password: 'secret', name: 'Ada' },
      }
    );

    expect(error.requestInfo?.headers?.Authorization).toBe(REDACTED);
    expect(error.requestInfo?.headers?.Accept).toBe('application/json');
    expect(error.requestInfo?.body).toEqual({ password: REDACTED, name: 'Ada' });

    const json = error.toJSON();
    expect(json.requestInfo?.headers?.Authorization).toBe(REDACTED);
    expect(JSON.stringify(json)).not.toContain('top-secret');
    expect(JSON.stringify(json)).not.toContain('secret');
  });

  it('sanitizeRequestInfo returns undefined for missing info', () => {
    expect(sanitizeRequestInfo(undefined)).toBeUndefined();
  });
});
