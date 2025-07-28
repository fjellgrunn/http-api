/* eslint-disable no-undefined */
import { putMethod } from "../../src/api/putMethod";
import { ApiParams } from "../../src/api";
import { getHttp } from "../../src/api/http";
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe("putMethod", () => {
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

  beforeEach(() => {
    (getHttp as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue(mockHttp);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should call http with correct parameters", async () => {
    const put = putMethod(apiParams);
    const path = "/test-path";
    const body = { key: "value" };
    const response = { success: true };

    // @ts-ignore
    mockHttp.mockResolvedValueOnce(response);

    const result = await put(path, body);

    expect(mockHttp).toHaveBeenCalledWith("PUT", path, body, {
      isJson: true,
      isJsonBody: true,
      contentType: "application/json",
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual(response);
  });

  it("should merge default options with provided options", async () => {
    const put = putMethod(apiParams);
    const path = "/test-path";
    const body = { key: "value" };
    const response = { success: true };

    // @ts-ignore
    mockHttp.mockResolvedValueOnce(response);

    const result = await put(path, body, { isJson: false, contentType: "text/plain" });

    expect(mockHttp).toHaveBeenCalledWith("PUT", path, body, {
      isJson: false,
      isJsonBody: true,
      contentType: "text/plain",
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual(response);
  });

  it("should handle empty body and options", async () => {
    const put = putMethod(apiParams);
    const path = "/test-path";
    const response = { success: true };

    // @ts-ignore
    mockHttp.mockResolvedValueOnce(response);

    const result = await put(path);

    expect(mockHttp).toHaveBeenCalledWith("PUT", path, {}, {
      isJson: true,
      isJsonBody: true,
      contentType: "application/json",
      accept: "application/json",
      params: {},
      isAuthenticated: true,
      skipContentType: false,
      requestCredentials: "include",
    });
    expect(result).toEqual(response);
  });
});
