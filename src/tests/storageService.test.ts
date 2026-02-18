
import { describe, it, expect } from 'vitest';
import { validateImportedData } from '../services/storageService';

describe('storageService data validation', () => {
  it('should accept valid task arrays', () => {
    const validTasks = [
      { id: '1', title: 'Task 1', status: 'IDLE' },
      { id: '2', title: 'Task 2', status: 'COMPLETED' }
    ];
    expect(validateImportedData(validTasks)).toEqual(validTasks);
  });

  it('should reject non-array inputs', () => {
    expect(validateImportedData({ key: 'value' })).toBeNull();
    expect(validateImportedData("invalid")).toBeNull();
  });

  it('should reject arrays with missing required fields', () => {
    const invalidTasks = [
      { title: 'Missing ID' }
    ];
    expect(validateImportedData(invalidTasks)).toBeNull();
  });

  it('should return empty array for empty input', () => {
    expect(validateImportedData([])).toEqual([]);
  });
});
