import { describe, it, expect } from 'vitest';
import { SyncClientImplementation } from '@powersync/common';
import {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from '@powersync/web';
import { createRawTableSQL, baseSchema } from './powersync-schema';

const POWERSYNC_URL = 'http://localhost:2718';

class TestBackendConnector implements PowerSyncBackendConnector {
  constructor(private readonly metadata: { token: string; endpoint: string }) {}

  async fetchCredentials() {
    return {
      endpoint: this.metadata.endpoint,
      token: this.metadata.token,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;
    await transaction.complete();
  }
}

describe('PowerSync Raw Tables Connection Test', () => {
  it('should connect to PowerSync', async () => {
    console.log('Starting test...');

    const token = process.env.POWERSYNC_TOKEN;

    console.log('Creating PowerSync database with raw tables schema...');

    const db = new PowerSyncDatabase({
      schema: baseSchema,
      database: new WASQLiteOpenFactory({
        dbFilename: 'db.sqlite',
        debugMode: true,
        vfs: WASQLiteVFS.OPFSCoopSyncVFS,
        flags: {
          enableMultiTabs: false,
        },
      }),
      flags: {
        enableMultiTabs: false,
      },
    });

    console.log('Initializing database...');

    await db.disconnectAndClear();
    await db.init();

    console.log('Creating raw tables...');
    await db.execute(createRawTableSQL);
    console.log('Raw tables created successfully');

    const connector = new TestBackendConnector({
      token,
      endpoint: POWERSYNC_URL,
    });

    console.log(`Connecting to PowerSync...`);

    await db.connect(connector, {
      clientImplementation: SyncClientImplementation.RUST,
    });

    console.log('Waiting for PowerSync to be ready...');

    await db.waitForReady();

    console.log('PowerSync is ready');

    console.log('Waiting for first sync...');

    const progressInterval = setInterval(() => {
      const status = db.currentStatus;
      const downloadProgress = status.downloadProgress;
      const isDownloading = status.dataFlowStatus?.downloading;
      const downloadError = status.dataFlowStatus?.downloadError;

      if (downloadProgress && isDownloading) {
        const fraction = downloadProgress.downloadedFraction || 0;
        const percentage = Math.round(fraction * 100);
        const downloaded = downloadProgress.downloadedOperations || 0;
        const total = downloadProgress.totalOperations || 0;

        console.log(`Sync progress: ${percentage}% (${downloaded}/${total} operations)`);
      } else if (status.hasSynced) {
        console.log('Sync completed - 100%');
      } else if (downloadError) {
        console.log(downloadError);
      }
    }, 1000);

    try {
      await db.waitForFirstSync();
      console.log('First sync completed');
    } finally {
      clearInterval(progressInterval);
    }

    const status = db.currentStatus;
    console.log('Connection status:', {
      connected: status.connected,
      hasSynced: status.hasSynced,
      downloading: status.dataFlowStatus?.downloading,
    });

    expect(status.connected).toBe(true);
    expect(status.hasSynced).toBe(true);
  }, 300000);
});
