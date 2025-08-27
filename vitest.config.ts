import { searchForWorkspaceRoot, loadEnv } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    worker: {
      format: 'es',
      plugins: () => [wasm(), topLevelAwait()],
    },
    optimizeDeps: {
      exclude: ['@journeyapps/wa-sqlite', '@powersync/web'],
      include: ['@powersync/web > js-logger'],
    },
    plugins: [wasm(), topLevelAwait()],
    server: {
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          '@powersync/web/lib/src/worker/db/WASQLiteDB.worker.js',
        ],
      },
    },
    test: {
      include: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx'],
      browser: {
        enabled: true,
        headless: false,
        provider: 'playwright',
        screenshotFailures: false,
        name: 'chromium',
      },
    },
    define: {
      'process.env': JSON.stringify({
        POWERSYNC_TOKEN: env.POWERSYNC_TOKEN || '',
      }),
    },
  };
});
