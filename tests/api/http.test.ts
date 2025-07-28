/* eslint-disable no-undefined */
import { getHttp } from "../../src/api/http";
import { ApiParams } from "../../src/api";
import {
  ClientError,
  ConflictError,
  ForbiddenError,
  GoneError,
  InternalServerError,
  MethodNotAllowedError,
  NotFoundError,
  NotImplementedError,
  RequestTimeoutError,
  ServerError,
  ServiceUnavailableError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../../src/errors";
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Declare fetchMock on globalThis for TypeScript
declare global {
   
  var fetchMock: any;
}

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

const mockApiParams: ApiParams = {
  config: {
    url: "http://example.com",
    clientName: "test-client",
    requestCredentials: "include",
  },
  // @ts-ignore
  populateAuthHeader: vi.fn().mockResolvedValue(undefined),
  // @ts-ignore
  uploadAsyncFile: vi.fn().mockResolvedValue(undefined),
};

describe("getHttp", () => {
  const http = getHttp(mockApiParams);

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetchMock.mockReset();
  });

  it("should make a successful GET request", async () => {
    const mockResponse = { data: "test" };
    globalThis.fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });

    const result = await http("GET", "/test", null, {});

    expect(result).toEqual(mockResponse);
    expect(globalThis.fetchMock).toHaveBeenCalledWith(
      "http://example.com/test",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Client-Name": "test-client",
        }),
        credentials: "include",
      })
    );
  });

  it("should handle a client error", async () => {
    globalThis.fetchMock.mockResponseOnce(null, { status: 400, statusText: "Bad Request" });
    await expect(http("GET", "/bad-request", null, {})).rejects.toThrow(ClientError);
  });

  it("should handle a 401 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Unauthorized", { status: 401 });
    await expect(http("GET", "/unauthorized", null, {})).rejects.toThrow(UnauthorizedError);
  });

  it("should handle a 403 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Forbidden", { status: 403 });
    await expect(http("GET", "/forbidden", null, {})).rejects.toThrow(ForbiddenError);
  });

  it("should handle a 404 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Not Found", { status: 404 });
    await expect(http("GET", "/not-found", null, {})).rejects.toThrow(NotFoundError);
  });

  it("should handle a 405 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Method Not Allowed", { status: 405 });
    await expect(http("GET", "/method-not-allowed", null, {})).rejects.toThrow(MethodNotAllowedError);
  });

  it("should handle a 408 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Request Timeout", { status: 408 });
    await expect(http("GET", "/request-timeout", null, {})).rejects.toThrow(RequestTimeoutError);
  });

  it("should handle a 409 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Conflict", { status: 409 });
    await expect(http("GET", "/conflict", null, {})).rejects.toThrow(ConflictError);
  });

  it("should handle a 410 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Gone", { status: 410 });
    await expect(http("GET", "/gone", null, {})).rejects.toThrow(GoneError);
  });

  it("should handle a 429 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Too Many Requests", { status: 429 });
    await expect(http("GET", "/too-many-requests", null, {})).rejects.toThrow(TooManyRequestsError);
  });

  it("should handle a 451 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Unavailable For Legal Reasons", { status: 451 });
    await expect(http("GET", "/unavailable-legal", null, {})).rejects.toThrow(ClientError);
  });

  it("should handle a 500 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Internal Server Error", { status: 500 });
    await expect(http("GET", "/server-error", null, {})).rejects.toThrow(InternalServerError);
  });

  it("should parse JSON response", async () => {
    const mockResponse = { data: "test" };
    globalThis.fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });
    const result = await http("GET", "/test");
    expect(result).toEqual(mockResponse);
  });

  it("should handle non-JSON response", async () => {
    globalThis.fetchMock.mockResponseOnce("plain text response", { status: 200 });
    const result = await http("GET", "/test", null, { isJson: false });
    expect(result).toEqual("plain text response");
  });

  it("should handle a generic server error", async () => {
    globalThis.fetchMock.mockResponseOnce("Bad Gateway", { status: 502 });
    await expect(http("GET", "/bad-gateway", null, {})).rejects.toThrow(ServerError);
  });

  it("should handle a 503 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Service Unavailable", { status: 503 });
    await expect(http("GET", "/service-unavailable", null, {})).rejects.toThrow(ServiceUnavailableError);
  });

  it("should handle a 501 error", async () => {
    globalThis.fetchMock.mockResponseOnce("Not Implemented", { status: 501 });
    await expect(http("GET", "/not-implemented", null, {})).rejects.toThrow(NotImplementedError);
  });

  it("should throw an error when JSON parsing fails", async () => {
    globalThis.fetchMock.mockResponseOnce("invalid JSON", { status: 200 });
    await expect(http("GET", "/invalid-json", null, {})).rejects.toThrow(SyntaxError);
  });

  it("should handle a non-JSON body", async () => {
    const mockResponse = "plain text response";
    globalThis.fetchMock.mockResponseOnce(mockResponse, { status: 200 });
    const result = await http("POST", "/test", "plain text body", { isJsonBody: false, isJson: false });

    expect(result).toEqual(mockResponse);
    expect(globalThis.fetchMock).toHaveBeenCalledWith(
      "http://example.com/test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Client-Name": "test-client",
        }),
        credentials: "include",
      })
    );
  });

  it("should handle a JSON body with a non-JSON response", async () => {
    const mockResponse = "plain text response";
    globalThis.fetchMock.mockResponseOnce(mockResponse, { status: 200 });
    const result = await http("POST", "/test", { key: "value" }, { isJsonBody: true, isJson: false });

    expect(result).toEqual(mockResponse);
    expect(globalThis.fetchMock).toHaveBeenCalledWith(
      "http://example.com/test",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Client-Name": "test-client",
        }),
        credentials: "include",
        body: JSON.stringify({ key: "value" }),
      })
    );
  });

});