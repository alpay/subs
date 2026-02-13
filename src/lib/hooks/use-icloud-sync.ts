import { useEffect, useState } from 'react';

import {
  getICloudBackupInfo,
  uploadToICloud,
  type ICloudBackupInfo,
} from '@/lib/icloud-sync';

const AUTO_SYNC_DELAY_MS = 2000;

type UseICloudBackupInfoArgs = {
  enabled: boolean;
  available: boolean;
};

export function useICloudBackupInfo({ enabled, available }: UseICloudBackupInfoArgs) {
  const [backupInfo, setBackupInfo] = useState<ICloudBackupInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled || !available)
      return;

    void (async () => {
      try {
        const info = await getICloudBackupInfo();
        if (!cancelled)
          setBackupInfo(info);
      }
      catch {
        if (!cancelled)
          setBackupInfo(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [available, enabled]);

  return { backupInfo, setBackupInfo };
}

type UseICloudAutoSyncArgs = {
  enabled: boolean;
  available: boolean;
  deps: unknown[];
  onSyncStart: () => void;
  onSyncEnd: () => void;
  onSyncError: (message: string) => void;
};

export function useICloudAutoSync({
  enabled,
  available,
  deps,
  onSyncStart,
  onSyncEnd,
  onSyncError,
}: UseICloudAutoSyncArgs) {
  useEffect(() => {
    if (!enabled || !available)
      return;

    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (cancelled)
        return;

      queueMicrotask(() => {
        if (!cancelled)
          onSyncStart();
      });

      void uploadToICloud()
        .then(() => {
          if (!cancelled)
            onSyncEnd();
        })
        .catch(() => {
          if (!cancelled) {
            onSyncEnd();
            onSyncError('Failed to sync to iCloud');
          }
        });
    }, AUTO_SYNC_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [enabled, available, onSyncEnd, onSyncError, onSyncStart, ...deps]);
}

