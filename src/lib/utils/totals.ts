import { endOfMonth, endOfYear, parseISO, startOfMonth, startOfYear } from 'date-fns';

import type { CurrencyRates, Settings, Subscription } from '@/lib/db/schema';
import { convertCurrency, roundCurrency } from './currency';
import { getPaymentDatesInRange, isSubscriptionActive } from './subscription-dates';

export function getMonthlyEquivalent(subscription: Subscription) {
  const interval = subscription.intervalCount || 1;
  switch (subscription.scheduleType) {
    case 'weekly':
      return (subscription.amount * 52) / 12 / interval;
    case 'yearly':
      return subscription.amount / 12 / interval;
    case 'custom':
      return subscription.intervalUnit === 'week'
        ? (subscription.amount * 52) / 12 / interval
        : subscription.amount / interval;
    case 'monthly':
    default:
      return subscription.amount / interval;
  }
}

export function calculateMonthlyTotal(
  subscriptions: Subscription[],
  monthDate: Date,
  settings: Settings,
  rates: CurrencyRates,
) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const total = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const dueDates = getPaymentDatesInRange(sub, start, end);
      const converted = dueDates.reduce((acc) => {
        const amount = convertCurrency(sub.amount, sub.currency, settings.mainCurrency, rates);
        return acc + amount;
      }, 0);
      return sum + converted;
    }, 0);

  return roundCurrency(total, settings.roundWholeNumbers);
}

export function calculateYearlyForecast(
  subscriptions: Subscription[],
  settings: Settings,
  rates: CurrencyRates,
) {
  const total = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const monthlyEquivalent = getMonthlyEquivalent(sub);
      const yearly = monthlyEquivalent * 12;
      const converted = convertCurrency(yearly, sub.currency, settings.mainCurrency, rates);
      return sum + converted;
    }, 0);

  return roundCurrency(total, settings.roundWholeNumbers);
}

export function calculateAverageMonthly(
  subscriptions: Subscription[],
  settings: Settings,
  rates: CurrencyRates,
) {
  const yearly = calculateYearlyForecast(subscriptions, settings, rates);
  return roundCurrency(yearly / 12, settings.roundWholeNumbers);
}

export function calculateTotalSpent(
  subscription: Subscription,
  settings: Settings,
  rates: CurrencyRates,
  now = new Date(),
) {
  const start = parseISO(subscription.startDate);
  const end = subscription.statusChangedAt ? parseISO(subscription.statusChangedAt) : now;
  const payments = getPaymentDatesInRange(subscription, start, end);
  const total = payments.length * subscription.amount;
  const converted = convertCurrency(total, subscription.currency, settings.mainCurrency, rates);
  return roundCurrency(converted, settings.roundWholeNumbers);
}

export function calculateYearToDateTotal(
  subscriptions: Subscription[],
  settings: Settings,
  rates: CurrencyRates,
  date = new Date(),
) {
  const start = startOfYear(date);
  const end = endOfYear(date);
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const dueDates = getPaymentDatesInRange(sub, start, end);
      const total = dueDates.length * sub.amount;
      const converted = convertCurrency(total, sub.currency, settings.mainCurrency, rates);
      return sum + converted;
    }, 0);
}
