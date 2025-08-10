/**
 * Integration test for advanced configuration example
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@fjell/http-api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}), { virtual: true });

import { get, post } from '@fjell/http-api';

import {
  advancedConfigurationExample,
  contentTypeExample,
  customHeadersExample,
  environmentConfigExample,
  queryParametersExample,
  requestCredentialsExample,
  responseHandlingExample
} from '../../examples/advanced-configuration-example';

describe('Advanced Configuration Example', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
    get.mockReset();
    post.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('customHeadersExample executes HTTP requests', async () => {
    get.mockResolvedValue({});
    await customHeadersExample();
    expect(get).toHaveBeenCalled();
  });

  test('customHeadersExample handles request errors', async () => {
    get.mockRejectedValueOnce(new Error('failure'));

    await customHeadersExample();

    expect(console.error).toHaveBeenCalled();
  });

  test('contentTypeExample executes HTTP requests', async () => {
    post.mockResolvedValue({});
    await contentTypeExample();
    expect(post).toHaveBeenCalled();
  });

  test('requestCredentialsExample executes HTTP requests', async () => {
    get.mockResolvedValue({});
    post.mockResolvedValue({});
    await requestCredentialsExample();
    expect(get).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
  });

  test('queryParametersExample executes HTTP requests', async () => {
    get.mockResolvedValue({});
    await queryParametersExample();
    expect(get).toHaveBeenCalled();
  });

  test('responseHandlingExample executes HTTP requests', async () => {
    get.mockResolvedValue({});
    await responseHandlingExample();
    expect(get).toHaveBeenCalled();
  });

  test('advancedConfigurationExample executes all examples', async () => {
    get.mockResolvedValue({});
    post.mockResolvedValue({});
    await advancedConfigurationExample();
    expect(get).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
  });

  test('environmentConfigExample executes HTTP requests', async () => {
    get.mockResolvedValue({});
    await environmentConfigExample();
    expect(get).toHaveBeenCalled();
  });
});
