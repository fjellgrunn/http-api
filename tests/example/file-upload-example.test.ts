/**
 * Integration test for file upload example
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@fjell/http-api', () => ({
  post: vi.fn(),
  postFileMethod: vi.fn(),
  uploadAsyncMethod: vi.fn(),
}), { virtual: true });

import { post, postFileMethod, uploadAsyncMethod } from '@fjell/http-api';

import {
  asyncFileUploadExample,
  basicFileUploadExample,
  fileUploadWithValidationExample,
  multipleFileUploadExample,
  resumableUploadExample
} from '../../examples/file-upload-example';

describe('File Upload Example', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
    post.mockReset();
    postFileMethod.mockReset();
    uploadAsyncMethod.mockReset();
    (fetch as any).mockReset && (fetch as any).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('basicFileUploadExample uploads a file', async () => {
    postFileMethod.mockResolvedValue({ id: '1' });
    await basicFileUploadExample();
    expect(postFileMethod).toHaveBeenCalled();
  });

  test('basicFileUploadExample handles upload errors', async () => {
    postFileMethod.mockRejectedValueOnce(new Error('upload failed'));

    await basicFileUploadExample();

    expect(console.error).toHaveBeenCalled();
  });

  test('asyncFileUploadExample handles async uploads', async () => {
    vi.useFakeTimers();
    uploadAsyncMethod.mockResolvedValue({ upload_id: '123', status: 'processing' });
    (fetch as any).mockResponseOnce(JSON.stringify({ status: 'completed', progress: 100 }));

    const promise = asyncFileUploadExample();
    await vi.runAllTimersAsync();
    await promise;
    vi.useRealTimers();

    expect(uploadAsyncMethod).toHaveBeenCalled();
    expect((fetch as any).mock.calls.length).toBeGreaterThan(0);
  });

  test('multipleFileUploadExample uploads multiple files', async () => {
    postFileMethod.mockResolvedValue({});
    post.mockResolvedValue({});
    await multipleFileUploadExample();
    expect(postFileMethod).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
  });

  test('resumableUploadExample performs chunked upload', async () => {
    post.mockResolvedValueOnce({ upload_url: 'http://upload', session_id: 'abc' });
    postFileMethod.mockResolvedValue({});
    post.mockResolvedValue({});
    await resumableUploadExample();
    expect(post).toHaveBeenCalled();
    expect(postFileMethod).toHaveBeenCalled();
  });

  test('fileUploadWithValidationExample validates before upload', async () => {
    postFileMethod.mockResolvedValue({});
    await fileUploadWithValidationExample();
    expect(postFileMethod).toHaveBeenCalled();
  });
});
