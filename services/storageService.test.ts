
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadTasks, validateImportedData } from './storageService';
import { TaskStatus } from '../types';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array if no tasks in storage', () => {
    expect(loadTasks()).toEqual([]);
  });

  it('should validate correctly formatted import data', () => {
    const validData = [
      { id: '1', title: 'Test', status: TaskStatus.IDLE }
    ];
    expect(validateImportedData(validData)).not.toBeNull();
  });

  it('should reject malformed import data', () => {
    const invalidData = { not: 'an array' };
    expect(validateImportedData(invalidData)).toBeNull();
  });
});
