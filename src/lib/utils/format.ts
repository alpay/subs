import { format } from 'date-fns';

export function formatAmount(value: number, currency: string, roundWholeNumbers: boolean) {
  return `${value.toFixed(roundWholeNumbers ? 0 : 2)} ${currency}`;
}

export function formatMonthYear(date: Date) {
  return format(date, 'LLLL, yyyy');
}

export function formatDayMonth(date: Date) {
  return format(date, 'd MMM');
}
