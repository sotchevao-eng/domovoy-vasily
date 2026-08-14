export const EVENTS_PER_DAY = 10;

export const DAY_TIMES = [
  '08:00',
  '09:15',
  '10:40',
  '12:00',
  '13:30',
  '15:10',
  '16:45',
  '18:00',
  '19:30',
  '21:00',
] as const;

export function getDayTime(eventIndex: number): string {
  return DAY_TIMES[eventIndex] ?? DAY_TIMES[DAY_TIMES.length - 1] ?? '08:00';
}
