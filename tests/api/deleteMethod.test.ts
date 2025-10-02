 
import { deleteMethod } from "../../src/api/deleteMethod";
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

describe("deleteMethod", () => {
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
