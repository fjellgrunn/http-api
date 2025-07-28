/* eslint-disable no-undefined */
import { getMethod, GetMethodOptions } from "../../src/api/getMethod";
import { ApiParams } from "../../src/api";
import { getHttp } from "../../src/api/http";
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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
vi.mock("../../src/api/http");

describe("getMethod", () => {
  const mockHttp = vi.fn();
  const apiParams: ApiParams = {
    config: {
      requestCredentials: "include",
      url: "http://example.com",
      clientName: "test-client",
    },
    // @ts-ignore
    populateAuthHeader: vi.fn().mockResolvedValue(undefined),
    // @ts-ignore
    uploadAsyncFile: vi.fn().mockResolvedValue(undefined),
  };

  beforeAll(() => {
    (getHttp as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue(mockHttp);
  });

  beforeEach(() => {
    mockHttp.mockClear();
  });

  it("should call http with default options", async () => {
    const get = getMethod(apiParams);
    const path = "/test-path";

    // @ts-ignore
    mockHttp.mockResolvedValue({ data: "test" });

    const result = await get(path);

    expect(mockHttp).toHaveBeenCalledWith("GET", path, null, {
      isJson: true,
      isJsonBody: true,
      contentType: "application/json",
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual({ data: "test" });
  });

  it("should merge default options with provided options", async () => {
    const get = getMethod(apiParams);
    const path = "/test-path";
    const customOptions: Partial<GetMethodOptions> = {
      isJson: false,
      contentType: "text/plain",
    };

    // @ts-ignore
    mockHttp.mockResolvedValue({ data: "test" });

    const result = await get(path, customOptions);

    expect(mockHttp).toHaveBeenCalledWith("GET", path, null, {
      isJson: false,
      isJsonBody: true,
      contentType: "text/plain",
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual({ data: "test" });
  });

  it("should handle request with params", async () => {
    const get = getMethod(apiParams);
    const path = "/test-path";
    const customOptions: Partial<GetMethodOptions> = {
      params: { id: 123, active: true },
    };

    // @ts-ignore
    mockHttp.mockResolvedValue({ data: "test" });

    const result = await get(path, customOptions);

    expect(mockHttp).toHaveBeenCalledWith("GET", path, null, {
      isJson: true,
      isJsonBody: true,
      contentType: "application/json",
      accept: "application/json",
      params: { id: 123, active: true },
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual({ data: "test" });
  });

  it("should handle request with authentication", async () => {
    const get = getMethod(apiParams);
    const path = "/test-path";
    const customOptions: Partial<GetMethodOptions> = {
      isAuthenticated: false,
    };

    // @ts-ignore
    mockHttp.mockResolvedValue({ data: "test" });

    const result = await get(path, customOptions);

    expect(mockHttp).toHaveBeenCalledWith("GET", path, null, {
      isJson: true,
      isJsonBody: true,
      contentType: "application/json",
      accept: "application/json",
      params: {},
      isAuthenticated: false,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual({ data: "test" });
  });
});
