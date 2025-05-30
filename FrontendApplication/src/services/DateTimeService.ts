import { intervalToDuration } from 'date-fns';

export const getDurationString = (start: Date, end: Date): string => {
  const duration = intervalToDuration({ start, end });

  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};