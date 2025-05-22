/* eslint-disable no-undefined */
import { getMethod, GetMethodOptions } from "@/api/getMethod";
import { ApiParams } from "@/api";
import { getHttp } from "@/api/http";
import { jest } from '@jest/globals';

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
  }
});
jest.mock("@/api/http");

describe("getMethod", () => {
  const mockHttp = jest.fn();
  const apiParams: ApiParams = {
    config: {
      requestCredentials: "include",
      url: "http://example.com",
      clientName: "test-client",
    },
    // @ts-ignore
    populateAuthHeader: jest.fn().mockResolvedValue(undefined),
    // @ts-ignore
    uploadAsyncFile: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(() => {
    (getHttp as jest.Mock).mockReturnValue(mockHttp);
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