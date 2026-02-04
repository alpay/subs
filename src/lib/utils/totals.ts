import type { CurrencyRates, Settings, Subscription } from '@/lib/db/schema';

import { endOfMonth, endOfYear, parseISO, startOfMonth, startOfYear } from 'date-fns';
import { convertCurrency, roundCurrency } from './currency';
import { getPaymentDatesInRange } from './subscription-dates';

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

export type MonthlyTotalInput = {
  subscriptions: Subscription[];
  monthDate: Date;
  settings: Settings;
  rates: CurrencyRates;
};

export function calculateMonthlyTotal({ subscriptions, monthDate, settings, rates }: MonthlyTotalInput) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  const total = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const dueDates = getPaymentDatesInRange(sub, start, end);
      const converted = dueDates.reduce((acc) => {
        const amount = convertCurrency({
          amount: sub.amount,
          from: sub.currency,
          to: settings.mainCurrency,
          rates,
        });
        return acc + amount;
      }, 0);
      return sum + converted;
    }, 0);

  return roundCurrency(total, settings.roundWholeNumbers);
}

export type YearlyForecastInput = {
  subscriptions: Subscription[];
  settings: Settings;
  rates: CurrencyRates;
};

export function calculateYearlyForecast({ subscriptions, settings, rates }: YearlyForecastInput) {
  const total = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const monthlyEquivalent = getMonthlyEquivalent(sub);
      const yearly = monthlyEquivalent * 12;
      const converted = convertCurrency({
        amount: yearly,
        from: sub.currency,
        to: settings.mainCurrency,
        rates,
      });
      return sum + converted;
    }, 0);

  return roundCurrency(total, settings.roundWholeNumbers);
}

export type AverageMonthlyInput = {
  subscriptions: Subscription[];
  settings: Settings;
  rates: CurrencyRates;
};

export function calculateAverageMonthly({ subscriptions, settings, rates }: AverageMonthlyInput) {
  const yearly = calculateYearlyForecast({ subscriptions, settings, rates });
  return roundCurrency(yearly / 12, settings.roundWholeNumbers);
}

export type TotalSpentInput = {
  subscription: Subscription;
  settings: Settings;
  rates: CurrencyRates;
  now?: Date;
};

export function calculateTotalSpent({ subscription, settings, rates, now = new Date() }: TotalSpentInput) {
  const start = parseISO(subscription.startDate);
  const end = subscription.statusChangedAt ? parseISO(subscription.statusChangedAt) : now;
  const payments = getPaymentDatesInRange(subscription, start, end);
  const total = payments.length * subscription.amount;
  const converted = convertCurrency({
    amount: total,
    from: subscription.currency,
    to: settings.mainCurrency,
    rates,
  });
  return roundCurrency(converted, settings.roundWholeNumbers);
}

export type YearToDateInput = {
  subscriptions: Subscription[];
  settings: Settings;
  rates: CurrencyRates;
  date?: Date;
};

export function calculateYearToDateTotal({ subscriptions, settings, rates, date = new Date() }: YearToDateInput) {
  const start = startOfYear(date);
  const end = endOfYear(date);
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => {
      const dueDates = getPaymentDatesInRange(sub, start, end);
      const total = dueDates.length * sub.amount;
      const converted = convertCurrency({
        amount: total,
        from: sub.currency,
        to: settings.mainCurrency,
        rates,
      });
      return sum + converted;
    }, 0);
}
