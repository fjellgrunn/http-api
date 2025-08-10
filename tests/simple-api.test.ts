import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const getImpl = vi.fn();
  const postImpl = vi.fn();
  const putImpl = vi.fn();
  const deleteImpl = vi.fn();
  const optionsImpl = vi.fn();
  const connectImpl = vi.fn();
  const traceImpl = vi.fn();
  const patchImpl = vi.fn();
  const postFileImpl = vi.fn();
  const uploadAsyncImpl = vi.fn();

  return {
    getImpl,
    postImpl,
    putImpl,
    deleteImpl,
    optionsImpl,
    connectImpl,
    traceImpl,
    patchImpl,
    postFileImpl,
    uploadAsyncImpl,
    getMethodFactory: vi.fn(() => getImpl),
    postMethodFactory: vi.fn(() => postImpl),
    putMethodFactory: vi.fn(() => putImpl),
    deleteMethodFactory: vi.fn(() => deleteImpl),
    optionsMethodFactory: vi.fn(() => optionsImpl),
    connectMethodFactory: vi.fn(() => connectImpl),
    traceMethodFactory: vi.fn(() => traceImpl),
    patchMethodFactory: vi.fn(() => patchImpl),
    postFileMethodFactory: vi.fn(() => postFileImpl),
    uploadAsyncMethodFactory: vi.fn(() => uploadAsyncImpl),
  };
});

vi.mock('../src/api/getMethod', () => ({ getMethod: mocks.getMethodFactory }));
vi.mock('../src/api/postMethod', () => ({ postMethod: mocks.postMethodFactory }));
vi.mock('../src/api/putMethod', () => ({ putMethod: mocks.putMethodFactory }));
vi.mock('../src/api/deleteMethod', () => ({ deleteMethod: mocks.deleteMethodFactory }));
vi.mock('../src/api/optionsMethod', () => ({ optionsMethod: mocks.optionsMethodFactory }));
vi.mock('../src/api/connectMethod', () => ({ connectMethod: mocks.connectMethodFactory }));
vi.mock('../src/api/traceMethod', () => ({ traceMethod: mocks.traceMethodFactory }));
vi.mock('../src/api/patchMethod', () => ({ patchMethod: mocks.patchMethodFactory }));
vi.mock('../src/api/postFileMethod', () => ({ postFileMethod: mocks.postFileMethodFactory }));
vi.mock('../src/api/uploadAsyncMethod', () => ({ uploadAsyncMethod: mocks.uploadAsyncMethodFactory }));

describe('simple-api wrappers', () => {
  it('should call underlying implementations', async () => {
    const {
      get,
      post,
      put,
      deleteMethod,
      options,
      connect,
      trace,
      patch,
      postFileMethod,
      uploadAsyncMethod,
    } = await import('../src/simple-api');

    get('/path', { headers: { a: 'b' } });
    post('/path', { foo: 'bar' }, { headers: { c: 'd' } });
    put('/path', { foo: 'bar' }, { headers: { e: 'f' } });
    deleteMethod('/path', { foo: 'bar' }, { headers: { g: 'h' } });
    options('/path', { headers: { i: 'j' } });
    connect('/path', { headers: { k: 'l' } });
    trace('/path', { headers: { m: 'n' } });
    patch('/path', { foo: 'bar' }, { headers: { o: 'p' } });
    const file = { name: 'file.txt' } as any;
    postFileMethod('/upload', file, { headers: { q: 'r' } });
    uploadAsyncMethod('/upload', 'file://uri', { headers: { s: 't' } });

    expect(mocks.getImpl).toHaveBeenCalledWith('/path', { headers: { a: 'b' } });
    expect(mocks.postImpl).toHaveBeenCalledWith('/path', { foo: 'bar' }, { headers: { c: 'd' } });
    expect(mocks.putImpl).toHaveBeenCalledWith('/path', { foo: 'bar' }, { headers: { e: 'f' } });
    expect(mocks.deleteImpl).toHaveBeenCalledWith('/path', { foo: 'bar' }, { headers: { g: 'h' } });
    expect(mocks.optionsImpl).toHaveBeenCalledWith('/path', { headers: { i: 'j' } });
    expect(mocks.connectImpl).toHaveBeenCalledWith('/path', { headers: { k: 'l' } });
    expect(mocks.traceImpl).toHaveBeenCalledWith('/path', { headers: { m: 'n' } });
    expect(mocks.patchImpl).toHaveBeenCalledWith('/path', { foo: 'bar' }, { headers: { o: 'p' } });

    const [postFilePath, body, headers, fileBuffer, opts] = mocks.postFileImpl.mock.calls[0];
    expect(postFilePath).toBe('/upload');
    expect(body).toEqual({});
    expect(headers).toEqual({});
    expect(fileBuffer.buffer).toBeInstanceOf(Buffer);
    expect(fileBuffer.bufferName).toBe('file.txt');
    expect(opts).toEqual({ headers: { q: 'r' } });

    expect(mocks.uploadAsyncImpl).toHaveBeenCalledWith('/upload', 'file://uri', { headers: { s: 't' } });
  });
});
