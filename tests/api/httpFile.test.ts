 
import { ApiParams } from "../../src/api";
import { getHttpFile } from "../../src/api/httpFile";
import { beforeEach, describe, expect, it, vi } from 'vitest';
// import setupGlobalFetchMock from 'vitest-fetch-mock'; // REMOVED

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
      populateAuthHeader: vi.fn().mockResolvedValue(undefined),
      // @ts-ignore
      uploadAsyncFile: vi.fn().mockResolvedValue(undefined),
    };
    globalThis.fetchMock.mockReset(); // Use globalThis.fetchMock
    httpFile = getHttpFile(apiParams);
  });

  it("should make a successful API call with JSON response", async () => {
    globalThis.fetchMock.mockResponse(JSON.stringify({ success: true }));

    const response = await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("file content"), bufferName: "file.txt" },
      {},
      { key: "value" },
      {}
    );

    expect(response).toEqual({ success: true });
    expect(globalThis.fetchMock).toHaveBeenCalledWith(
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
    globalThis.fetchMock.mockResponse(JSON.stringify({ message: "Error occurred" }), { status: 400 });

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

    expect(globalThis.fetchMock).toHaveBeenCalledWith(
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
    globalThis.fetchMock.mockResponse(JSON.stringify({ success: true }));

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
    globalThis.fetchMock.mockResponse("Plain text response");

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
    globalThis.fetchMock.mockReject(new Error("Network error"));

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

    expect(globalThis.fetchMock).toHaveBeenCalledWith(
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
    globalThis.fetchMock.mockResponse(JSON.stringify(mockResponse));

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
    const fetchCall = globalThis.fetchMock.mock.calls[0];
    const sentFormData = fetchCall[1]?.body as FormData;

    expect(sentFormData.get("description")).toBe("Test file upload");
    expect(sentFormData.get("category")).toBe("documents");
    expect(sentFormData.get("tags")).toEqual("test,upload");
    expect(sentFormData.get("file")).toBeInstanceOf(Blob);

    expect(globalThis.fetchMock).toHaveBeenCalledWith(
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
    globalThis.fetchMock.mockResponse(errorMessage, { status: 404 });

    await expect(httpFile(
      "POST",
      "/upload/missing",
      { buffer: Buffer.from("file content"), bufferName: "file.txt" },
      { isJson: false },
      { key: "value" },
      {},
    )).rejects.toThrow("Resource not found");

    expect(globalThis.fetchMock).toHaveBeenCalledWith(
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
    globalThis.fetchMock.mockResponse(JSON.stringify(responseData));

    const result = await httpFile(
      "POST",
      "/upload",
      { buffer: Buffer.from("test content"), bufferName: "test.txt" }
    );

    expect(result).toEqual(responseData);

    expect(globalThis.fetchMock).toHaveBeenCalledWith(
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
    const fetchCall = globalThis.fetchMock.mock.calls[0];
    const sentFormData = fetchCall[1]?.body as FormData;
    expect(sentFormData.get("file")).toBeInstanceOf(Blob);
    // FormData should only have 1 entry
    let count = 0;
    sentFormData.forEach(() => count++);
    expect(count).toBe(1);
  });
});