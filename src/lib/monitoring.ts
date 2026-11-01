import type { ReactNativeOptions } from '@sentry/react-native';

type Env = {
  dsn: string | undefined;
  isDev: boolean;
};

/**
 * Sentry options for this build. Without a DSN (local dev without .env, tests)
 * the SDK is disabled entirely, so nothing is sent and nothing breaks.
 */
export function buildSentryOptions({ dsn, isDev }: Env): ReactNativeOptions {
  const trimmedDsn = dsn?.trim() || undefined;
  return {
    dsn: trimmedDsn,
    enabled: trimmedDsn !== undefined,
    environment: isDev ? 'development' : 'production',
    // Full tracing while developing; sample in release to stay within quota.
    tracesSampleRate: isDev ? 1 : 0.2,
    // Recording users' faces and scripts is private; never attach screenshots
    // or view hierarchy, and send no default PII (IP address etc.).
    attachScreenshot: false,
    attachViewHierarchy: false,
    sendDefaultPii: false,
  };
}
