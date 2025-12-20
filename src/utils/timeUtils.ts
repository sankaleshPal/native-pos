/**
 * Format elapsed time from a start timestamp
 * Returns format like "2h 30m" or "45m" or "30s"
 */
export const formatElapsedTime = (startTime: string): string => {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const diffMs = now - start;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format KOT date and time for display
 * Returns format like "19 Dec 2025, 12:30 PM"
 */
export const formatKOTDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${day} ${month} ${year}, ${hours}:${minutesStr} ${ampm}`;
};

/**
 * Get time difference in milliseconds
 */
export const getTimeDifference = (start: string, end: string): number => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return endTime - startTime;
};

/**
 * Format time for display (short format)
 * Returns format like "12:30 PM"
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
};

/**
 * Format date for display (short format)
 * Returns format like "19 Dec"
 */
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
};
