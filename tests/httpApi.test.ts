import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const deleteImpl = vi.fn();
  const getImpl = vi.fn();
  const postImpl = vi.fn();
  const putImpl = vi.fn();
  const optionsImpl = vi.fn();
  const connectImpl = vi.fn();
  const traceImpl = vi.fn();
  const patchImpl = vi.fn();
  const postFileImpl = vi.fn();
  const uploadAsyncImpl = vi.fn();

  return {
    deleteImpl,
    getImpl,
    postImpl,
    putImpl,
    optionsImpl,
    connectImpl,
    traceImpl,
    patchImpl,
    postFileImpl,
    uploadAsyncImpl,
    deleteMethodFactory: vi.fn(() => deleteImpl),
    getMethodFactory: vi.fn(() => getImpl),
    postMethodFactory: vi.fn(() => postImpl),
    putMethodFactory: vi.fn(() => putImpl),
    optionsMethodFactory: vi.fn(() => optionsImpl),
    connectMethodFactory: vi.fn(() => connectImpl),
    traceMethodFactory: vi.fn(() => traceImpl),
    patchMethodFactory: vi.fn(() => patchImpl),
    postFileMethodFactory: vi.fn(() => postFileImpl),
    uploadAsyncMethodFactory: vi.fn(() => uploadAsyncImpl),
  };
});

vi.mock('../src/api/deleteMethod', () => ({ deleteMethod: mocks.deleteMethodFactory }));
vi.mock('../src/api/getMethod', () => ({ getMethod: mocks.getMethodFactory }));
vi.mock('../src/api/postMethod', () => ({ postMethod: mocks.postMethodFactory }));
vi.mock('../src/api/putMethod', () => ({ putMethod: mocks.putMethodFactory }));
vi.mock('../src/api/optionsMethod', () => ({ optionsMethod: mocks.optionsMethodFactory }));
vi.mock('../src/api/connectMethod', () => ({ connectMethod: mocks.connectMethodFactory }));
vi.mock('../src/api/traceMethod', () => ({ traceMethod: mocks.traceMethodFactory }));
vi.mock('../src/api/patchMethod', () => ({ patchMethod: mocks.patchMethodFactory }));
vi.mock('../src/api/postFileMethod', () => ({ postFileMethod: mocks.postFileMethodFactory }));
vi.mock('../src/api/uploadAsyncMethod', () => ({ uploadAsyncMethod: mocks.uploadAsyncMethodFactory }));

describe('getHttpApi', () => {
  it('creates http api with all methods', async () => {
    const { getHttpApi } = await import('../src/api');

    const apiParams = {
      config: {
        url: 'https://example.com',
        requestCredentials: 'include' as RequestCredentials,
        clientName: 'test-client',
      },
      populateAuthHeader: vi.fn(),
      uploadAsyncFile: vi.fn(),
    };

    const api = getHttpApi(apiParams);

    expect(mocks.deleteMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.getMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.postMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.putMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.optionsMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.connectMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.traceMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.patchMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.postFileMethodFactory).toHaveBeenCalledWith(apiParams);
    expect(mocks.uploadAsyncMethodFactory).toHaveBeenCalledWith(apiParams);

    expect(api.httpDelete).toBe(mocks.deleteImpl);
    expect(api.httpGet).toBe(mocks.getImpl);
    expect(api.httpPost).toBe(mocks.postImpl);
    expect(api.httpPut).toBe(mocks.putImpl);
    expect(api.httpOptions).toBe(mocks.optionsImpl);
    expect(api.httpConnect).toBe(mocks.connectImpl);
    expect(api.httpTrace).toBe(mocks.traceImpl);
    expect(api.httpPatch).toBe(mocks.patchImpl);
    expect(api.httpPostFile).toBe(mocks.postFileImpl);
    expect(api.uploadAsync).toBe(mocks.uploadAsyncImpl);
  });
});
