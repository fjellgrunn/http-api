/**
 * Integration test for basic HTTP methods example
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@fjell/http-api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  deleteMethod: vi.fn(),
}), { virtual: true });

import { deleteMethod, get, post, put } from '@fjell/http-api';
import { basicHttpExamples, errorHandlingExample } from '../../examples/basic-http-methods';

describe('Basic HTTP Methods Example', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
    get.mockReset();
    post.mockReset();
    put.mockReset();
    deleteMethod.mockReset();
  });

  test('basicHttpExamples makes expected HTTP calls', async () => {
    get
      .mockResolvedValueOnce([{ id: 1, name: 'User' }])
      .mockResolvedValueOnce([{ id: 1, username: 'Bret' }]);
    post
      .mockResolvedValueOnce({ id: 101 })
      .mockResolvedValueOnce({ id: 201 });
    put.mockResolvedValueOnce({ id: 1 });
    deleteMethod.mockResolvedValueOnce();

    await basicHttpExamples();

    expect(get).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenCalledTimes(2);
    expect(put).toHaveBeenCalledTimes(1);
    expect(deleteMethod).toHaveBeenCalledTimes(1);
  });

  test('basicHttpExamples handles successful responses with empty arrays', async () => {
    get
      .mockResolvedValueOnce([]) // Empty array case
      .mockResolvedValueOnce([{ id: 1, username: 'Bret' }]);
    post
      .mockResolvedValueOnce({ id: 101 })
      .mockResolvedValueOnce({ id: 201 });
    put.mockResolvedValueOnce({ id: 1 });
    deleteMethod.mockResolvedValueOnce();

    await basicHttpExamples();

    expect(get).toHaveBeenCalledTimes(2);
    expect(post).toHaveBeenCalledTimes(2);
    expect(put).toHaveBeenCalledTimes(1);
    expect(deleteMethod).toHaveBeenCalledTimes(1);
  });

  test('errorHandlingExample handles request errors', async () => {
    get.mockRejectedValueOnce(new Error('Not found'));
    post.mockRejectedValueOnce(new Error('Validation error'));

    await errorHandlingExample();

    expect(get).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
  });

  test('basicHttpExamples logs errors on failure', async () => {
    get.mockRejectedValueOnce(new Error('Network error'));

    await basicHttpExamples();

    expect(console.error).toHaveBeenCalled();
  });
});
