/**
 * iCloud sync using react-native-cloud-storage
 * Syncs app DB (subscriptions, categories, lists, payment methods, settings) to iCloud
 * @see https://react-native-cloud-storage.oss.kuatsu.de/docs/api/CloudStorage
 */

import {
  CloudStorage,
  CloudStorageErrorCode,
  CloudStorageScope,
} from 'react-native-cloud-storage';

import {
  getCategories,
  getLists,
  getPaymentMethods,
  getSettings,
  getSubscriptions,
  saveCategories,
  saveLists,
  savePaymentMethods,
  saveSettings,
  saveSubscriptions,
} from '@/lib/db/storage';

const BACKUP_DIR = '/Subs';
const BACKUP_FILE = `${BACKUP_DIR}/subs-backup.json`;

// Explicit scope: App Data = iCloud container (example app uses this for iCloud)
const SCOPE = CloudStorageScope.AppData;

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  isRetryable: (err: unknown) => boolean,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    }
    catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === RETRY_ATTEMPTS)
        throw err;
      await delay(RETRY_DELAY_MS);
    }
  }
  throw lastErr;
}

export type ICloudSyncStatus = 'unavailable' | 'idle' | 'syncing' | 'error';

export type ICloudBackupInfo = {
  exists: boolean;
  createdAt?: string;
  subscriptionCount?: number;
};

/**
 * Whether cloud storage (iCloud on iOS) is available.
 */
export async function isICloudAvailableForUI(): Promise<boolean> {
  return CloudStorage.isCloudAvailable();
}

/**
 * Upload full DB snapshot to iCloud. Always creates /Subs first (exists() can throw before we get to mkdir).
 */
export async function uploadToICloud(): Promise<void> {
  const available = await CloudStorage.isCloudAvailable();
  if (!available) {
    throw new Error('iCloud is not available. Sign in to iCloud in Settings.');
  }

  const now = new Date().toISOString();

  const backup = {
    createdAt: now,
    subscriptions: getSubscriptions(),
    categories: getCategories(),
    lists: getLists(),
    paymentMethods: getPaymentMethods(),
    settings: getSettings(),
  };

  const json = JSON.stringify(backup);

  const isDirNotFound = (err: unknown) =>
    (err as { code?: string })?.code === CloudStorageErrorCode.DIRECTORY_NOT_FOUND;

  try {
    await withRetry(async () => {
      CloudStorage.setProviderOptions({ scope: SCOPE });
      await CloudStorage.mkdir(BACKUP_DIR);
      await CloudStorage.writeFile(BACKUP_FILE, json);
    }, isDirNotFound);
  }
  catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === CloudStorageErrorCode.DIRECTORY_NOT_FOUND) {
      throw new Error(
        'iCloud Drive isn\'t ready. Turn on iCloud Drive in Settings → [Your Name] → iCloud, then try Backup again in a few seconds.',
      );
    }
    throw err;
  }
}

/**
 * Download backup from iCloud and restore into local DB.
 * Uses triggerSync so iCloud has finished downloading the file before read.
 */
export async function downloadFromICloud(): Promise<void> {
  const available = await CloudStorage.isCloudAvailable();
  if (!available) {
    throw new Error('iCloud is not available. Sign in to iCloud in Settings.');
  }

  const isDirNotFound = (err: unknown) =>
    (err as { code?: string })?.code === CloudStorageErrorCode.DIRECTORY_NOT_FOUND;

  let content: string;
  try {
    content = await withRetry(async () => {
      CloudStorage.setProviderOptions({ scope: SCOPE });
      const fileExists = await CloudStorage.exists(BACKUP_FILE);
      if (!fileExists) {
        throw new Error('No backup found in iCloud. Please create a backup first.');
      }
      await CloudStorage.triggerSync(BACKUP_FILE);
      return CloudStorage.readFile(BACKUP_FILE);
    }, isDirNotFound);
  }
  catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === CloudStorageErrorCode.DIRECTORY_NOT_FOUND) {
      throw new Error(
        'iCloud Drive isn\'t ready. Turn on iCloud Drive in Settings → [Your Name] → iCloud, then try again in a few seconds.',
      );
    }
    throw err;
  }

  let backup: unknown;
  try {
    backup = JSON.parse(content);
  }
  catch {
    throw new Error('Invalid backup file format. The backup may be corrupted.');
  }

  if (!backup || typeof backup !== 'object') {
    throw new Error('Invalid backup file structure.');
  }

  const data = backup as Record<string, unknown>;

  if (data.subscriptions && Array.isArray(data.subscriptions)) {
    saveSubscriptions(data.subscriptions as Parameters<typeof saveSubscriptions>[0]);
  }
  if (data.categories && Array.isArray(data.categories)) {
    saveCategories(data.categories as Parameters<typeof saveCategories>[0]);
  }
  if (data.lists && Array.isArray(data.lists)) {
    saveLists(data.lists as Parameters<typeof saveLists>[0]);
  }
  if (data.paymentMethods && Array.isArray(data.paymentMethods)) {
    savePaymentMethods(data.paymentMethods as Parameters<typeof savePaymentMethods>[0]);
  }
  if (data.settings && typeof data.settings === 'object' && data.settings !== null) {
    saveSettings(data.settings as Parameters<typeof saveSettings>[0]);
  }
}

/**
 * Return metadata about the current backup in iCloud (if any).
 */
export async function getICloudBackupInfo(): Promise<ICloudBackupInfo> {
  const available = await CloudStorage.isCloudAvailable();
  if (!available)
    return { exists: false };

  const isDirNotFound = (err: unknown) =>
    (err as { code?: string })?.code === CloudStorageErrorCode.DIRECTORY_NOT_FOUND;

  try {
    let content: string | null = null;

    await withRetry(async () => {
      CloudStorage.setProviderOptions({ scope: SCOPE });
      const exists = await CloudStorage.exists(BACKUP_FILE);
      if (!exists) {
        content = null;
        return;
      }
      await CloudStorage.triggerSync(BACKUP_FILE);
      content = await CloudStorage.readFile(BACKUP_FILE);
    }, isDirNotFound);

    if (content == null)
      return { exists: false };

    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const createdAt = typeof parsed.createdAt === 'string'
        ? parsed.createdAt
        : undefined;
      const subs = Array.isArray(parsed.subscriptions)
        ? (parsed.subscriptions as unknown[])
        : [];

      return {
        exists: true,
        createdAt,
        subscriptionCount: subs.length,
      };
    }
    catch {
      // Backup var ama metadata yok / bozuksa sadece exists=true döneriz
      return { exists: true };
    }
  }
  catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === CloudStorageErrorCode.DIRECTORY_NOT_FOUND) {
      throw new Error(
        'iCloud Drive isn\'t ready. Turn on iCloud Drive in Settings → [Your Name] → iCloud, then try again in a few seconds.',
      );
    }
    throw err;
  }
}

/**
 * Simple boolean wrapper around getICloudBackupInfo.
 */
export async function hasICloudBackup(): Promise<boolean> {
  const info = await getICloudBackupInfo();
  return info.exists;
}
