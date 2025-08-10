/* eslint-disable no-undefined */
import { optionsMethod } from "../../src/api/optionsMethod";
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

describe("optionsMethod", () => {
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
    const optionsFn = optionsMethod(apiParams);
    const path = "/test-path";

    // @ts-ignore
    mockHttp.mockResolvedValue({ data: "test" });

    const result = await optionsFn(path);

    expect(mockHttp).toHaveBeenCalledWith("OPTIONS", path, null, {
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
});
