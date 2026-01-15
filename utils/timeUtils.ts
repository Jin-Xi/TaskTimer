
/**
 * Formats milliseconds into a HH:MM:SS string.
 * @param ms Milliseconds to format
 */
export const formatTime = (ms: number): string => {
  if (ms < 0) return "00:00:00";
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Formats duration into a human-readable string like '1h 30m' or '45m'.
 */
export const formatDurationHuman = (ms: number, language: 'en' | 'zh' = 'zh'): string => {
  const min = Math.floor(ms / 1000 / 60);
  const hr = Math.floor(min / 60);
  
  if (hr > 0) {
    return language === 'zh' ? `${hr}小时 ${min % 60}分钟` : `${hr}h ${min % 60}m`;
  }
  return language === 'zh' ? `${min}分钟` : `${min}m`;
};
