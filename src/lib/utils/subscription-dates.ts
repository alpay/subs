import { addMonths, addWeeks, addYears, endOfMonth, isAfter, isBefore, isEqual, parseISO, startOfDay, startOfMonth } from 'date-fns';

import type { Subscription } from '@/lib/db/schema';

function addInterval(date: Date, subscription: Subscription) {
  const interval = subscription.intervalCount || 1;
  switch (subscription.scheduleType) {
    case 'weekly':
      return addWeeks(date, interval);
    case 'yearly':
      return addYears(date, interval);
    case 'custom':
      return subscription.intervalUnit === 'week'
        ? addWeeks(date, interval)
        : addMonths(date, interval);
    case 'monthly':
    default:
      return addMonths(date, interval);
  }
}

export function computeNextPaymentDate(subscription: Subscription, fromDate = new Date()) {
  const from = startOfDay(fromDate);
  let next = startOfDay(parseISO(subscription.billingAnchor));
  let guard = 0;

  while (isBefore(next, from)) {
    next = addInterval(next, subscription);
    guard += 1;
    if (guard > 2000) {
      break;
    }
  }

  return next;
}

export function getPaymentDatesInRange(subscription: Subscription, start: Date, end: Date) {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  const dates: Date[] = [];

  let next = computeNextPaymentDate(subscription, startDay);
  let guard = 0;

  while (isBefore(next, endDay) || isEqual(next, endDay)) {
    dates.push(next);
    next = addInterval(next, subscription);
    guard += 1;
    if (guard > 2000) {
      break;
    }
  }

  return dates;
}

export function getPaymentDatesForMonth(subscription: Subscription, monthDate: Date) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  return getPaymentDatesInRange(subscription, start, end);
}

export function isPaymentDueOnDate(subscription: Subscription, date: Date) {
  const day = startOfDay(date);
  const next = computeNextPaymentDate(subscription, day);
  return isEqual(next, day);
}

export function isSubscriptionActive(subscription: Subscription, date = new Date()) {
  if (subscription.status === 'active') {
    return true;
  }
  if (subscription.status === 'paused') {
    return false;
  }
  if (subscription.status === 'canceled') {
    return false;
  }
  return isAfter(startOfDay(parseISO(subscription.startDate)), startOfDay(date));
}
