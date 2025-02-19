/* eslint-disable no-undefined */
import { getHttp } from "@/api/http";
import { ApiParams } from "@/api";
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
} from "@/errors";

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

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockApiParams: ApiParams = {
  config: {
    url: "http://example.com",
    clientName: "test-client",
    requestCredentials: "include",
  },
  populateAuthHeader: jest.fn().mockResolvedValue(undefined),
  uploadAsyncFile: jest.fn().mockResolvedValue(undefined),
};

describe("getHttp", () => {
  const http = getHttp(mockApiParams);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should make a successful GET request", async () => {
    const mockResponse = { data: "test" };
    mockFetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
    });

    const result = await http("GET", "/test", null, {});

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
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
    mockFetch.mockResolvedValue({
      status: 400,
      text: jest.fn().mockResolvedValue("Bad Request"),
    });

    await expect(http("GET", "/bad-request", null, {})).rejects.toThrow(ClientError);
  });

  it("should handle a 401 error", async () => {
    mockFetch.mockResolvedValue({
      status: 401,
      text: jest.fn().mockResolvedValue("Unauthorized"),
    });

    await expect(http("GET", "/unauthorized", null, {})).rejects.toThrow(UnauthorizedError);
  });

  it("should handle a 403 error", async () => {
    mockFetch.mockResolvedValue({
      status: 403,
      text: jest.fn().mockResolvedValue("Forbidden"),
    });

    await expect(http("GET", "/forbidden", null, {})).rejects.toThrow(ForbiddenError);
  });

  it("should handle a 404 error", async () => {
    mockFetch.mockResolvedValue({
      status: 404,
      text: jest.fn().mockResolvedValue("Not Found"),
    });

    await expect(http("GET", "/not-found", null, {})).rejects.toThrow(NotFoundError);
  });

  it("should handle a 405 error", async () => {
    mockFetch.mockResolvedValue({
      status: 405,
      text: jest.fn().mockResolvedValue("Method Not Allowed"),
    });

    await expect(http("GET", "/method-not-allowed", null, {})).rejects.toThrow(MethodNotAllowedError);
  });

  it("should handle a 408 error", async () => {
    mockFetch.mockResolvedValue({
      status: 408,
      text: jest.fn().mockResolvedValue("Request Timeout"),
    });

    await expect(http("GET", "/request-timeout", null, {})).rejects.toThrow(RequestTimeoutError);
  });

  it("should handle a 409 error", async () => {
    mockFetch.mockResolvedValue({
      status: 409,
      text: jest.fn().mockResolvedValue("Conflict"),
    });

    await expect(http("GET", "/conflict", null, {})).rejects.toThrow(ConflictError);
  });

  it("should handle a 410 error", async () => {
    mockFetch.mockResolvedValue({
      status: 410,
      text: jest.fn().mockResolvedValue("Gone"),
    });

    await expect(http("GET", "/gone", null, {})).rejects.toThrow(GoneError);
  });

  it("should handle a 429 error", async () => {
    mockFetch.mockResolvedValue({
      status: 429,
      text: jest.fn().mockResolvedValue("Too Many Requests"),
    });

    await expect(http("GET", "/too-many-requests", null, {})).rejects.toThrow(TooManyRequestsError);
  });

  it("should handle a 451 error", async () => {
    mockFetch.mockResolvedValue({
      status: 451,
      text: jest.fn().mockResolvedValue("Unavailable For Legal Reasons"),
    });

    await expect(http("GET", "/unavailable-legal", null, {})).rejects.toThrow(ClientError);
  });
  
  it("should handle a 500 error", async () => {
    mockFetch.mockResolvedValue({
      status: 500,
      text: jest.fn().mockResolvedValue("Internal Server Error"),
    });

    await expect(http("GET", "/server-error", null, {})).rejects.toThrow(InternalServerError);
  });

  it("should parse JSON response", async () => {
    const mockResponse = { data: "test" };
    mockFetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
    });

    const result = await http("GET", "/test");

    expect(result).toEqual(mockResponse);
  });

  it("should handle non-JSON response", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue("plain text response"),
    });

    const result = await http("GET", "/test", null, { isJson: false });

    expect(result).toEqual("plain text response");
  });

  it("should handle a generic server error", async () => {
    mockFetch.mockResolvedValue({
      status: 502,
      text: jest.fn().mockResolvedValue("Bad Gateway"),
    });

    await expect(http("GET", "/bad-gateway", null, {})).rejects.toThrow(ServerError);
  });

  it("should handle a 503 error", async () => {
    mockFetch.mockResolvedValue({
      status: 503,
      text: jest.fn().mockResolvedValue("Service Unavailable"),
    });

    await expect(http("GET", "/service-unavailable", null, {})).rejects.toThrow(ServiceUnavailableError);
  });

  it("should handle a 501 error", async () => {
    mockFetch.mockResolvedValue({
      status: 501,
      text: jest.fn().mockResolvedValue("Not Implemented"),
    });

    await expect(http("GET", "/not-implemented", null, {})).rejects.toThrow(NotImplementedError);
  });

  it("should throw an error when JSON parsing fails", async () => {
    mockFetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue("invalid JSON"),
    });

    await expect(http("GET", "/invalid-json", null, {})).rejects.toThrow(SyntaxError);
  });

  it("should handle a non-JSON body", async () => {
    const mockResponse = "plain text response";
    mockFetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await http("POST", "/test", "plain text body", { isJsonBody: false, isJson: false });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
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
    mockFetch.mockResolvedValue({
      status: 200,
      text: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await http("POST", "/test", { key: "value" }, { isJsonBody: true, isJson: false });

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
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