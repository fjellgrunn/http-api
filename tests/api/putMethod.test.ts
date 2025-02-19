/* eslint-disable no-undefined */
import { putMethod } from "@/api/putMethod";
import { ApiParams } from "@/api";
import { getHttp } from "@/api/http";

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
jest.mock("../../src/api/http");

describe("putMethod", () => {
  const mockHttp = jest.fn();
  const apiParams: ApiParams = {
    config: {
      requestCredentials: "include",
      url: "http://example.com",
      clientName: "test-client",
    },
    populateAuthHeader: jest.fn().mockResolvedValue(undefined),
    uploadAsyncFile: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    (getHttp as jest.Mock).mockReturnValue(mockHttp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call http with correct parameters", async () => {
    const put = putMethod(apiParams);
    const path = "/test-path";
    const body = { key: "value" };
    const response = { success: true };

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