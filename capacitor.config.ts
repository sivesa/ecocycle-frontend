import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Target-aware Capacitor config.
 *
 * One native project serves both apps. Pick the target with APP_TARGET:
 *   APP_TARGET=household npx cap sync android   # EcoCycle (household)
 *   APP_TARGET=collector  npx cap sync android   # EcoCycle Collector
 *
 * Defaults to household so `npx cap add android`/`npx cap open` stay safe
 * when APP_TARGET is not exported.
 */
const target = (process.env.APP_TARGET ?? 'household') as 'household' | 'collector';

const CONFIGS: Record<'household' | 'collector', CapacitorConfig> = {
  household: {
    appId: 'co.za.ecocycle.household',
    appName: 'EcoCycle',
    webDir: 'dist/household',
    android: { flavor: 'household' },
    ios: { scheme: 'App Household' },
  },
  collector: {
    appId: 'co.za.ecocycle.collector',
    appName: 'EcoCycle Collector',
    webDir: 'dist/collector',
    android: { flavor: 'collector' },
    ios: { scheme: 'App Collector' },
  },
};

const config = CONFIGS[target];
console.log(
  `[capacitor] target=${target} appId=${config.appId} webDir=${config.webDir} ` +
    `androidFlavor=${config.android?.flavor} iosScheme=${config.ios?.scheme}`
);

export default config;