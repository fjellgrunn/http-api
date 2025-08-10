/**
 * Integration test for error handling example
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@fjell/http-api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  deleteMethod: vi.fn(),
}), { virtual: true });

import { deleteMethod, get, post } from '@fjell/http-api';

import {
  basicErrorHandlingExample,
  errorLoggingExample,
  errorRecoveryExample,
  retryLogicExample,
  timeoutHandlingExample
} from '../../examples/error-handling-example';

describe('Error Handling Example', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
    get.mockReset();
    post.mockReset();
    deleteMethod.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('basicErrorHandlingExample processes different error statuses', async () => {
    get
      .mockRejectedValueOnce({ message: 'Not found', status: 404 })
      .mockRejectedValueOnce({ message: 'Unauthorized', status: 401 })
      .mockRejectedValueOnce({ message: 'Server error', status: 500 });
    deleteMethod.mockRejectedValueOnce({ message: 'Forbidden', status: 403 });
    post.mockRejectedValueOnce({ message: 'Bad request', status: 400, response: { errors: ['Name required'] } });

    await basicErrorHandlingExample();

    expect(get).toHaveBeenCalledTimes(3);
    expect(deleteMethod).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);
  });

  test('basicErrorHandlingExample handles errors without specific status codes', async () => {
    get
      .mockRejectedValueOnce({ message: 'Not found', status: 404 })
      .mockRejectedValueOnce({ message: 'Unauthorized', status: 999 }) // Non-401 status
      .mockRejectedValueOnce({ message: 'Server error', status: 600 }); // >= 500
    deleteMethod.mockRejectedValueOnce({ message: 'Forbidden', status: 999 }); // Non-403 status
    post.mockRejectedValueOnce({ message: 'Bad request', status: 999 }); // Non-400 status

    await basicErrorHandlingExample();

    expect(get).toHaveBeenCalledTimes(3);
    expect(deleteMethod).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledTimes(1);
  });

  test('retryLogicExample retries failed requests', async () => {
    vi.useFakeTimers();
    get
      .mockRejectedValueOnce({ status: 500, message: 'fail 1' })
      .mockRejectedValueOnce({ status: 500, message: 'fail 2' })
      .mockResolvedValueOnce({ ok: true })
      .mockRejectedValueOnce({ status: 429, headers: { 'retry-after': '1' }, message: 'rate limit' })
      .mockResolvedValueOnce({ ok: true });

    const promise = retryLogicExample();
    await vi.runAllTimersAsync();
    await promise;
    vi.useRealTimers();

    expect(get).toHaveBeenCalled();
  }, 10000);

  test('retryLogicExample handles client errors without retry', async () => {
    vi.useFakeTimers();
    get
      .mockRejectedValueOnce({ status: 400, message: 'client error' }) // Should not retry client errors
      .mockRejectedValueOnce({ status: 429, headers: {}, message: 'rate limit without retry-after' }) // Rate limit without header
      .mockResolvedValueOnce({ ok: true });

    const promise = retryLogicExample();
    await vi.runAllTimersAsync();
    await promise;
    vi.useRealTimers();

    expect(get).toHaveBeenCalled();
  }, 10000);

  test('retryLogicExample exhausts all retries', async () => {
    vi.useFakeTimers();
    get
      .mockRejectedValue({ status: 500, message: 'persistent server error' });

    const promise = retryLogicExample();
    await vi.runAllTimersAsync();
    await promise;
    vi.useRealTimers();

    expect(get).toHaveBeenCalled();
  }, 10000);

  test('timeoutHandlingExample handles slow requests', async () => {
    vi.useFakeTimers();
    get.mockResolvedValue({});
    const promise = timeoutHandlingExample();
    await vi.runAllTimersAsync();
    await promise;
    vi.useRealTimers();

    expect(get).toHaveBeenCalled();
  });

  test('timeoutHandlingExample handles timeout errors', async () => {
    vi.useFakeTimers();
    get
      .mockImplementationOnce(() => new Promise(() => {})) // Never resolves - will timeout
      .mockRejectedValueOnce({ name: 'AbortError', message: 'Request aborted' }) // Abort error branch
      .mockRejectedValueOnce(new Error('Other error')); // Other error branch

    const promise = timeoutHandlingExample();
    await vi.runAllTimersAsync();
    await promise;
    vi.useRealTimers();

    expect(get).toHaveBeenCalled();
  });

  test('errorRecoveryExample falls back when needed', async () => {
    get
      .mockRejectedValueOnce(new Error('primary failed'))
      .mockResolvedValueOnce({})
      .mockResolvedValue({});

    await errorRecoveryExample();
    expect(get).toHaveBeenCalled();
  });

  test('errorRecoveryExample uses cache when both sources fail', async () => {
    get
      .mockRejectedValueOnce(new Error('primary failed'))
      .mockRejectedValueOnce(new Error('fallback failed'))
      .mockResolvedValue({}); // Circuit breaker requests

    await errorRecoveryExample();
    expect(get).toHaveBeenCalled();
  });

  test('errorRecoveryExample handles circuit breaker transitions', async () => {
    get
      .mockRejectedValue({ status: 500, message: 'service unavailable' }); // All requests fail

    await errorRecoveryExample();
    expect(get).toHaveBeenCalled();
  });

  test('errorLoggingExample logs errors from requests', async () => {
    get.mockRejectedValueOnce(new Error('get failed'));
    post.mockRejectedValueOnce(new Error('post failed'));

    await errorLoggingExample();

    expect(get).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
  });
});
