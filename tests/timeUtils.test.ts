
import { describe, it, expect } from 'vitest';
import { formatTime, formatDurationHuman } from '../utils/timeUtils';

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should format 0ms correctly', () => {
      expect(formatTime(0)).toBe('00:00:00');
    });

    it('should format seconds correctly', () => {
      expect(formatTime(5000)).toBe('00:00:05');
      expect(formatTime(59000)).toBe('00:00:59');
    });

    it('should format minutes correctly', () => {
      expect(formatTime(61000)).toBe('00:01:01');
      expect(formatTime(3540000)).toBe('00:59:00');
    });

    it('should format hours correctly', () => {
      expect(formatTime(3661000)).toBe('01:01:01');
      expect(formatTime(36000000)).toBe('10:00:00');
    });

    it('should handle negative values by returning zeros', () => {
      expect(formatTime(-1000)).toBe('00:00:00');
    });
  });

  describe('formatDurationHuman', () => {
    it('should format short durations in English', () => {
      expect(formatDurationHuman(60000, 'en')).toBe('1m');
    });

    it('should format long durations in Chinese', () => {
      const ninetyMins = 90 * 60 * 1000;
      expect(formatDurationHuman(ninetyMins, 'zh')).toBe('1小时 30分钟');
    });
  });
});
