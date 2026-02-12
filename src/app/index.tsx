import { Redirect } from 'expo-router';

import { getItem } from '@/lib/storage';

const ONBOARDING_COMPLETED_KEY = 'ONBOARDING_COMPLETED';

export default function Index() {
  const hasOnboarded = getItem<boolean>(ONBOARDING_COMPLETED_KEY) === true;

  if (hasOnboarded) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/onboarding" />;
}
