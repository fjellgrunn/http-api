/* eslint-disable no-undefined */
import { getHttpFile } from "@/api/httpFile";
import { ApiParams } from "@/api";
import fetchMock from "jest-fetch-mock";
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

fetchMock.enableMocks();

describe("getHttpFile", () => {
  let apiParams: ApiParams;
  let httpFile: ReturnType<typeof getHttpFile>;

  beforeEach(() => {
    apiParams = {
      config: {
        url: "https://api.example.com",
        clientName: "TestClient",
        requestCredentials: "include",
      },
      // @ts-ignore
      populateAuthHeader: jest.fn().mockResolvedValue(undefined),
      // @ts-ignore
      uploadAsyncFile: jest.fn().mockResolvedValue(undefined),
    };
    httpFile = getHttpFile(apiParams);
    fetchMock.resetMocks();
  });

  it("should make a successful API call with JSON response", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const response = await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("file content"), bufferName: "file.txt" },
      {},
      { key: "value" },
      {}
    );

    expect(response).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "X-Client-Name": "TestClient",
        }),
        body: expect.any(FormData),
        credentials: "include",
      })
    );
  });

  it("should handle API errors correctly", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: "Error occurred" }), { status: 400 });

    await expect(
      httpFile(
        "POST",
        "/upload",
        { buffer: Buffer.from("file content"), bufferName: "file.txt" },
        {},
        { key: "value" },
        {},
      )
    ).rejects.toThrow("Error occurred");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "X-Client-Name": "TestClient",
        }),
        body: expect.any(FormData),
        credentials: "include",
      })
    );
  });

  it("should populate auth header when isAuthenticated is true", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("file content"), bufferName: "file.txt" },
      { isAuthenticated: true },
      { key: "value" },
      {},
    );

    expect(apiParams.populateAuthHeader).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("should handle non-JSON response correctly", async () => {
    fetchMock.mockResponseOnce("Plain text response");

    const response = await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("file content"), bufferName: "file.txt" },
      { isJson: false },
      { key: "value" },
      {},
    );

    expect(response).toEqual("Plain text response");
  });

  it("should throw an error when fetch fails", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"));

    await expect(
      httpFile(
        "POST",
        "/upload",
        { buffer: Buffer.from("file content"), bufferName: "file.txt" },
        {},
        { key: "value" },
        {},
      )
    ).rejects.toThrow("Network error");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "X-Client-Name": "TestClient",
        }),
        body: expect.any(FormData),
        credentials: "include",
      })
    );
  });

  it("should handle body data alongside file upload", async () => {
    const mockResponse = { success: true };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const bodyData = {
      description: "Test file upload",
      category: "documents",
      tags: ["test", "upload"]
    };

    const response = await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("file content"), bufferName: "test-doc.txt" },
      {},
      bodyData,
      {},
    );

    expect(response).toEqual(mockResponse);

    // Verify the FormData was constructed correctly
    const fetchCall = fetchMock.mock.calls[0];
    const sentFormData = fetchCall[1]?.body as FormData;

    expect(sentFormData.get("description")).toBe("Test file upload");
    expect(sentFormData.get("category")).toBe("documents");
    expect(sentFormData.get("tags")).toEqual("test,upload");
    expect(sentFormData.get("file")).toBeInstanceOf(Blob);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "X-Client-Name": "TestClient"
        }),
        body: expect.any(FormData),
        credentials: "include"
      })
    );
  });

  it("should handle 404 error responses", async () => {
    const errorMessage = "Resource not found";
    fetchMock.mockResponseOnce(errorMessage, { status: 404 });

    await expect(httpFile(
      "POST",
      "/upload/missing",
      { buffer: Buffer.from("file content"), bufferName: "file.txt" },
      { isJson: false },
      { key: "value" },
      {},
    )).rejects.toThrow("Resource not found");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/upload/missing",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "X-Client-Name": "TestClient"
        }),
        body: expect.any(FormData),
        credentials: "include"
      })
    );
  });

  it("should handle request with minimal parameters", async () => {
    const responseData = { success: true };
    fetchMock.mockResponseOnce(JSON.stringify(responseData));

    const result = await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("test content"), bufferName: "test.txt" }
    );

    expect(result).toEqual(responseData);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "X-Client-Name": "TestClient"
        }),
        body: expect.any(FormData),
        credentials: "include"
      })
    );

    // Verify FormData only contains file
    const fetchCall = fetchMock.mock.calls[0];
    const sentFormData = fetchCall[1]?.body as FormData;
    expect(sentFormData.get("file")).toBeInstanceOf(Blob);
    // FormData should only have 1 entry
    let count = 0;
    sentFormData.forEach(() => count++);
    expect(count).toBe(1);
  });
});