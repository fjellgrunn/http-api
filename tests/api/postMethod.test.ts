import { postMethod, PostMethodOptions } from '@/api/postMethod';
import { getHttp } from '@/api/http';
import { ApiParams } from '@/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

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
vi.mock('@/api/http');

describe('postMethod', () => {
  let apiParams: ApiParams;
  let httpMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    apiParams = {
      config: {
        requestCredentials: 'same-origin',
      },
    } as ApiParams;
    httpMock = vi.fn();
    (getHttp as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue(httpMock);
  });

  test('should call http with correct method and path', async () => {
    const post = postMethod(apiParams);
    const path = '/test-path';
    const body = { key: 'value' };
    const response = { data: 'response' };

    // @ts-ignore
    httpMock.mockResolvedValue(response);

    const result = await post(path, body);

    expect(httpMock).toHaveBeenCalledWith('POST', path, body, expect.any(Object));
    expect(result).toBe(response);
  });

  test('should merge default options with provided options', async () => {
    const post = postMethod(apiParams);
    const path = '/test-path';
    const body = { key: 'value' };
    const customOptions: Partial<PostMethodOptions> = {
      isJson: false,
      contentType: 'text/plain',
    };

    await post(path, body, customOptions);

    const expectedOptions = {
      isJson: false,
      isJsonBody: true,
      contentType: 'text/plain',
      accept: 'application/json',
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: 'same-origin',
    };

    expect(httpMock).toHaveBeenCalledWith('POST', path, body, expectedOptions);
  });

  test('should use default options when no options are provided', async () => {
    const post = postMethod(apiParams);
    const path = '/test-path';
    const body = { key: 'value' };

    await post(path, body);

    const expectedOptions = {
      isJson: true,
      isJsonBody: true,
      contentType: 'application/json',
      accept: 'application/json',
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: 'same-origin',
    };

    expect(httpMock).toHaveBeenCalledWith('POST', path, body, expectedOptions);
  });

  test('should handle empty body', async () => {
    const post = postMethod(apiParams);
    const path = '/test-path';

    await post(path);

    expect(httpMock).toHaveBeenCalledWith('POST', path, {}, expect.any(Object));
  });
});