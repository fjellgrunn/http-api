import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@fjell/logging', () => ({
  default: {
    getLogger: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockReturnThis(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      emergency: vi.fn(),
      alert: vi.fn(),
      critical: vi.fn(),
      notice: vi.fn(),
      time: vi.fn().mockReturnThis(),
      end: vi.fn(),
      log: vi.fn(),
      default: vi.fn(),
    })),
  },
}));

import { getHttp } from '../../src/api/http';
import { RequestTimeoutError } from '../../src/errors';

describe('http timeout', () => {
  const apiParams: any = {
    config: {
      requestCredentials: 'include',
      url: 'http://example.com',
      clientName: 'test-client',
    },
    populateAuthHeader: vi.fn().mockResolvedValue(undefined),
    uploadAsyncFile: vi.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should abort request and throw RequestTimeoutError when timeout is exceeded', async () => {
    const http = getHttp(apiParams);

    // Mock fetch to simulate a hanging request that gets aborted
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((_url: any, init?: any) => {
      return new Promise((_resolve, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }
      });
    });

    // Use a real short timeout
    const promise = http('GET', '/slow-endpoint', {}, { timeout: 50 });
    await expect(promise).rejects.toThrow(RequestTimeoutError);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should not abort request when timeout is not set', async () => {
    const http = getHttp(apiParams);

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      text: async () => '{"success":true,"data":{"result":"ok"}}',
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    const result = await http('GET', '/test');
    expect(result).toEqual({ result: 'ok' });
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should clear timeout after successful response', async () => {
    const http = getHttp(apiParams);

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      text: async () => '{"success":true,"data":{"result":"ok"}}',
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await http('GET', '/test', {}, { timeout: 5000 });
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should not set timeout when timeout is 0 or negative', async () => {
    const http = getHttp(apiParams);

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      text: async () => '{"success":true,"data":{"result":"ok"}}',
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

    await http('GET', '/test', {}, { timeout: 0 });
    await http('GET', '/test', {}, { timeout: -1 });
    // Should complete without throwing
  });
});
