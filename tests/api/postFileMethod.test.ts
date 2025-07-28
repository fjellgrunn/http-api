/* eslint-disable no-undefined */
import { postFileMethod, PostFileMethodOptions } from "../../src/api/postFileMethod";
import { ApiParams } from "../../src/api";
import { getHttpFile } from "../../src/api/httpFile";
import { describe, expect, it, vi } from 'vitest';

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
vi.mock("../../src/api/httpFile");

describe("postFileMethod", () => {
  const mockApiParams: ApiParams = {
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

  const mockHttpFile = vi.fn();
  (getHttpFile as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue(mockHttpFile);

  const postFile = postFileMethod(mockApiParams);

  it("should call httpFile with correct parameters", async () => {
    const path = "/test-path";
    const body = { key: "value" };
    const headers = { "Content-Type": "application/json" };
    const file = { buffer: Buffer.from("test"), bufferName: "test.txt" };
    const postFileOptions: Partial<PostFileMethodOptions> = {
      isJson: false,
      accept: "application/xml",
      params: { test: "param" },
      isAuthenticated: false,
    };

    await postFile(path, body, headers, file, postFileOptions);

    expect(mockHttpFile).toHaveBeenCalledWith(
      "POST",
      path,
      file,
      expect.objectContaining({
        isJson: false,
        accept: "application/xml",
        params: { test: "param" },
        isAuthenticated: false,
        requestCredentials: "include",
      }),
      body,
      headers,
    );
  });

  it("should use default options when postFileOptions is not provided", async () => {
    const path = "/default-path";
    const body = { defaultKey: "defaultValue" };
    const headers = { "Content-Type": "application/json" };
    const file = { buffer: Buffer.from("default"), bufferName: "default.txt" };

    await postFile(path, body, headers, file);

    expect(mockHttpFile).toHaveBeenCalledWith(
      "POST",
      path,
      file,
      expect.objectContaining({
        isJson: true,
        accept: "application/json",
        params: {},
        isAuthenticated: true,
        requestCredentials: "include",
      }),
      body,
      headers,
    );
  });

  it("should handle empty body and headers", async () => {
    const path = "/empty-body-headers";
    const file = { buffer: Buffer.from("empty"), bufferName: "empty.txt" };

    await postFile(path, undefined, undefined, file);

    expect(mockHttpFile).toHaveBeenCalledWith(
      "POST",
      path,
      file,
      expect.objectContaining({
        isJson: true,
        accept: "application/json",
        params: {},
        isAuthenticated: true,
        requestCredentials: "include",
      }),
      {},
      {},
    );
  });
});
