import { uploadAsyncMethod, UploadAsyncMethodOptions } from "@/api/uploadAsyncMethod";
import { ApiParams } from "@/api";
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

describe('uploadAsyncMethod', () => {
  let mockApiParams: ApiParams;
  let mockPopulateAuthHeader: jest.Mock;
  let mockUploadAsyncFile: jest.Mock;

  beforeEach(() => {
    mockPopulateAuthHeader = jest.fn();
    mockUploadAsyncFile = jest.fn();
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
});