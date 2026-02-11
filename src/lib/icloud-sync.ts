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

  if (!(await isExistAsync(remoteFilePath, false))) {
    return; // No backup yet
  }

  const remotePath = `${defaultICloudContainerPath}/Documents/${ICLOUD_DIR}/${BACKUP_FILENAME}`;
  const localDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!localDir) {
    throw new Error('No local directory available');
  }

  const localPath = await downloadFileAsync(remotePath, localDir);
  const content = await FileSystem.readAsStringAsync(localPath, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const backup = JSON.parse(content);

  if (backup.subscriptions) {
    saveSubscriptions(backup.subscriptions);
  }
  if (backup.categories) {
    saveCategories(backup.categories);
  }
  if (backup.lists) {
    saveLists(backup.lists);
  }
  if (backup.paymentMethods) {
    savePaymentMethods(backup.paymentMethods);
  }
  if (backup.settings) {
    saveSettings(backup.settings);
  }
}
