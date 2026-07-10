import { uploadAsyncMethod, UploadAsyncMethodOptions } from "../../src/api/uploadAsyncMethod";
import { ApiParams } from "../../src/api";
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FjellHttpError } from "../../src/errors/FjellHttpError";

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

vi.mock("../../src/api/httpFile", () => ({
  // ... existing code ...
}));

describe('uploadAsyncMethod', () => {
  let mockApiParams: ApiParams;
  let mockPopulateAuthHeader: ReturnType<typeof vi.fn>;
  let mockUploadAsyncFile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPopulateAuthHeader = vi.fn();
    mockUploadAsyncFile = vi.fn();
    mockApiParams = {
      config: {
        url: 'http://example.com',
        clientName: 'test-client',
        requestCredentials: 'include',
      },
      // @ts-ignore
      populateAuthHeader: mockPopulateAuthHeader,
      // @ts-ignore
      uploadAsyncFile: mockUploadAsyncFile,
    };
  });

  it('should upload a file with default options', async () => {
    const uploadAsync = uploadAsyncMethod(mockApiParams);
    const mockResponse = {
      headers: {},
      status: 200,
      mimeType: 'application/json',
      body: JSON.stringify({ success: true }),
    };
    // @ts-ignore
    mockUploadAsyncFile.mockResolvedValue(mockResponse);

    const result = await uploadAsync('/upload', '/path/to/file');

    expect(result).toEqual({ success: true });
    expect(mockPopulateAuthHeader).toHaveBeenCalledWith(true, { "Accept": "application/json" });
    expect(mockUploadAsyncFile).toHaveBeenCalledWith(
      'http://example.com/upload',
      '/path/to/file',
      'POST',
      'multipart',
      'file',
      { Accept: 'application/json' }
    );
  });

  it('should upload a file with custom options', async () => {
    const uploadAsync = uploadAsyncMethod(mockApiParams);
    const mockResponse = {
      headers: {},
      status: 200,
      mimeType: 'application/json',
      body: JSON.stringify({ success: true }),
    };
    // @ts-ignore
    mockUploadAsyncFile.mockResolvedValue(mockResponse);

    const customOptions: Partial<UploadAsyncMethodOptions> = {
      method: 'PUT',
      isJson: false,
      accept: 'text/plain',
      params: { id: 123 },
      isAuthenticated: false,
      fieldName: 'customFile',
      headers: { 'Custom-Header': 'value' },
    };

    const result = await uploadAsync('/upload', '/path/to/file', customOptions);

    expect(result).toEqual(mockResponse.body);
    expect(mockPopulateAuthHeader).toHaveBeenCalledWith(false, { 'Custom-Header': 'value', Accept: 'text/plain' });
    expect(mockUploadAsyncFile).toHaveBeenCalledWith(
      'http://example.com/upload?id=123',
      '/path/to/file',
      'PUT',
      'multipart',
      'customFile',
      { 'Custom-Header': 'value', Accept: 'text/plain' }
    );
  });

  it('should handle errors during file upload', async () => {
    const uploadAsync = uploadAsyncMethod(mockApiParams);
    const mockError = new Error('Upload failed');
    // @ts-ignore
    mockUploadAsyncFile.mockRejectedValue(mockError);

    await expect(uploadAsync('/upload', '/path/to/file')).rejects.toThrow('Upload failed');
    expect(mockPopulateAuthHeader).toHaveBeenCalledWith(true, { "Accept": 'application/json' });
    expect(mockUploadAsyncFile).toHaveBeenCalledWith(
      'http://example.com/upload',
      '/path/to/file',
      'POST',
      'multipart',
      'file',
      { Accept: 'application/json' }
    );
  });

  it('should throw on HTTP error status from upload response', async () => {
    const uploadAsync = uploadAsyncMethod(mockApiParams);
    const mockResponse = {
      headers: {},
      status: 500,
      mimeType: 'application/json',
      body: JSON.stringify({ message: 'server exploded' }),
    };
    // @ts-ignore
    mockUploadAsyncFile.mockResolvedValue(mockResponse);

    await expect(uploadAsync('/upload', '/path/to/file')).rejects.toThrow('Upload failed with status 500');
  });

  it('should throw FjellHttpError for structured Fjell error body', async () => {
    const uploadAsync = uploadAsyncMethod(mockApiParams);
    const mockResponse = {
      headers: {},
      status: 400,
      mimeType: 'application/json',
      body: JSON.stringify({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'bad payload',
          operation: { type: 'create', name: 'upload', params: {} },
          context: { itemType: 'file' }
        }
      }),
    };
    // @ts-ignore
    mockUploadAsyncFile.mockResolvedValue(mockResponse);

    await expect(uploadAsync('/upload', '/path/to/file')).rejects.toBeInstanceOf(FjellHttpError);
  });
});
