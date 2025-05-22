/* eslint-disable no-undefined */
import { deleteMethod } from "@/api/deleteMethod";
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

describe("deleteMethod", () => {
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

  beforeEach(() => {
    (getHttp as jest.Mock).mockReturnValue(mockHttp);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call http with correct parameters", async () => {
    const path = "/test-path";
    const body = { key: "value" };
    const deleteOptions = {
      isJson: false,
      isJsonBody: false,
      contentType: "text/plain",
      accept: "text/plain",
      params: { test: "param" },
      isAuthenticated: false,
      skipContentType: true,
      requestCredentials: "same-origin" as RequestCredentials,
    };

    const deleteFn = deleteMethod(apiParams);
    await deleteFn(path, body, deleteOptions);

    expect(mockHttp).toHaveBeenCalledWith(
      "DELETE",
      path,
      body,
      expect.objectContaining(deleteOptions)
    );
  });

  it("should use default options when deleteOptions is not provided", async () => {
    const path = "/default-path";
    const body = { key: "default" };

    const deleteFn = deleteMethod(apiParams);
    await deleteFn(path, body);

    expect(mockHttp).toHaveBeenCalledWith(
      "DELETE",
      path,
      body,
      expect.objectContaining({
        isJson: true,
        isJsonBody: true,
        contentType: "application/json",
        accept: "application/json",
        params: {},
        isAuthenticated: true,
        skipContentType: false,
        requestCredentials: "include",
      })
    );
  });

  it("should merge default options with provided deleteOptions", async () => {
    const path = "/merge-path";
    const body = { key: "merge" };
    const deleteOptions = {
      isJson: false,
      params: { merge: "param" },
    };

    const deleteFn = deleteMethod(apiParams);
    await deleteFn(path, body, deleteOptions);

    expect(mockHttp).toHaveBeenCalledWith(
      "DELETE",
      path,
      body,
      expect.objectContaining({
        isJson: false,
        isJsonBody: true,
        contentType: "application/json",
        accept: "application/json",
        params: { merge: "param" },
        isAuthenticated: true,
        skipContentType: false,
        requestCredentials: "include",
      })
    );
  });

  it("should handle request with minimal parameters", async () => {
    const path = "/minimal-path";

    const deleteFn = deleteMethod(apiParams);
    await deleteFn(path);

    expect(mockHttp).toHaveBeenCalledWith(
      "DELETE",
      path,
      {},
      expect.objectContaining({
        isJson: true,
        isJsonBody: true,
        contentType: "application/json",
        accept: "application/json",
        params: {},
        isAuthenticated: true,
        skipContentType: false,
        requestCredentials: "include",
      })
    );
  });
});