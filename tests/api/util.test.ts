/* eslint-disable no-undefined */
import { generateQueryParameters } from '@/api/util';
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

describe('generateQueryParameters', () => {
  it('should return an empty string when no parameters are provided', () => {
    const params = {};
    const result = generateQueryParameters(params);
    expect(result).toBe('');
  });

  it('should generate query parameters for string values', () => {
    const params = { name: 'John', city: 'New York' };
    const result = generateQueryParameters(params);
    expect(result).toBe('?name=John&city=New%20York');
  });

  it('should generate query parameters for number values', () => {
    const params = { age: 30, score: 100 };
    const result = generateQueryParameters(params);
    expect(result).toBe('?age=30&score=100');
  });

  it('should generate query parameters for boolean values', () => {
    const params = { isActive: true, isVerified: false };
    const result = generateQueryParameters(params);
    expect(result).toBe('?isActive=true&isVerified=false');
  });

  it('should generate query parameters for Date values', () => {
    const date = new Date('2023-01-01T00:00:00Z');
    const params = { startDate: date };
    const result = generateQueryParameters(params);
    expect(result).toBe(`?startDate=${encodeURIComponent(date.toISOString())}`);
  });

  it('should ignore undefined values', () => {
    const params = { name: 'John', age: undefined };
    const result = generateQueryParameters(params);
    expect(result).toBe('?name=John');
  });

  it('should ignore empty string values', () => {
    const params = { name: 'John', city: '' };
    const result = generateQueryParameters(params);
    expect(result).toBe('?name=John');
  });

  it('should handle mixed types of parameters', () => {
    const date = new Date('2023-01-01T00:00:00Z');
    const params = { name: 'John', age: 30, isActive: true, startDate: date };
    const result = generateQueryParameters(params);
    expect(result).toBe(`?name=John&age=30&isActive=true&startDate=${encodeURIComponent(date.toISOString())}`);
  });

  it('should ignore null values', () => {
    const params = { name: 'John', age: null };
    // @ts-ignore
    const result = generateQueryParameters(params);
    expect(result).toBe('?name=John&age=');
  });
});