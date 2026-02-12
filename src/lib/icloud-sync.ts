/**
 * iCloud sync utilities using expo-icloud-storage
 * Syncs app data to iCloud Drive when enabled
 */

import {
  createDirAsync,
  defaultICloudContainerPath,
  downloadFileAsync,
  isExistAsync,
  isICloudAvailableAsync,
  uploadFileAsync,
} from '@oleg_svetlichnyi/expo-icloud-storage';
import * as FileSystem from 'expo-file-system/legacy';

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

const ICLOUD_DIR = 'Subs';
const BACKUP_FILENAME = 'subs-backup.json';

export type ICloudSyncStatus = ' unavailable' | 'idle' | 'syncing' | 'error';

export async function isICloudReady(): Promise<boolean> {
  const available = await isICloudAvailableAsync();
  return available && defaultICloudContainerPath != null;
}

export async function uploadToICloud(): Promise<void> {
  if (!(await isICloudReady()) || !defaultICloudContainerPath) {
    throw new Error('iCloud is not available');
  }

  const backup = {
    subscriptions: getSubscriptions(),
    categories: getCategories(),
    lists: getLists(),
    paymentMethods: getPaymentMethods(),
    settings: getSettings(),
  };

  const json = JSON.stringify(backup);
  const localPath = `${FileSystem.cacheDirectory}${BACKUP_FILENAME}`;
  await FileSystem.writeAsStringAsync(localPath, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (!(await isExistAsync(ICLOUD_DIR, true))) {
    await createDirAsync(ICLOUD_DIR);
  }

  await uploadFileAsync({
    destinationPath: `${ICLOUD_DIR}/${BACKUP_FILENAME}`,
    filePath: localPath,
  });
}

export async function downloadFromICloud(): Promise<void> {
  if (!(await isICloudReady()) || !defaultICloudContainerPath) {
    throw new Error('iCloud is not available');
  }

  const remoteFilePath = `${ICLOUD_DIR}/${BACKUP_FILENAME}`;

  // Check if the backup file exists in iCloud
  const fileExists = await isExistAsync(remoteFilePath, false);
  if (!fileExists) {
    throw new Error('No backup found in iCloud. Please create a backup first.');
  }

  // Construct the full path to the iCloud file
  const remotePath = `${defaultICloudContainerPath}/Documents/${ICLOUD_DIR}/${BACKUP_FILENAME}`;
  const localDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!localDir) {
    throw new Error('No local directory available');
  }

  try {
    // Download the file from iCloud
    const localPath = await downloadFileAsync(remotePath, localDir);

    // Read the downloaded file
    const content = await FileSystem.readAsStringAsync(localPath, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Parse the backup data
    let backup;
    try {
      backup = JSON.parse(content);
    }
    catch (parseError) {
      throw new Error('Invalid backup file format. The backup may be corrupted.');
    }

    // Validate backup structure
    if (!backup || typeof backup !== 'object') {
      throw new Error('Invalid backup file structure.');
    }

    // Restore data from backup
    if (backup.subscriptions && Array.isArray(backup.subscriptions)) {
      saveSubscriptions(backup.subscriptions);
    }
    if (backup.categories && Array.isArray(backup.categories)) {
      saveCategories(backup.categories);
    }
    if (backup.lists && Array.isArray(backup.lists)) {
      saveLists(backup.lists);
    }
    if (backup.paymentMethods && Array.isArray(backup.paymentMethods)) {
      savePaymentMethods(backup.paymentMethods);
    }
    if (backup.settings && typeof backup.settings === 'object') {
      saveSettings(backup.settings);
    }
  }
  catch (error) {
    // Re-throw with more context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to download from iCloud: ${String(error)}`);
  }
}
