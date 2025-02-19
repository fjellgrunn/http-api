/* eslint-disable no-undefined */
import { postFileMethod, PostFileMethodOptions } from "@/api/postFileMethod";
import { ApiParams } from "@/api";
import { getHttpFile } from "@/api/httpFile";

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
jest.mock("@/api/httpFile");

describe("postFileMethod", () => {
  const mockApiParams: ApiParams = {
    config: {
      requestCredentials: "include",
      url: "http://example.com",
      clientName: "test-client",
    },
    populateAuthHeader: jest.fn().mockResolvedValue(undefined),
    uploadAsyncFile: jest.fn().mockResolvedValue(undefined),
  };

  const mockHttpFile = jest.fn();
  (getHttpFile as jest.Mock).mockReturnValue(mockHttpFile);

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