import { buildSentryOptions } from './monitoring';

const DSN = 'https://public@o0.ingest.sentry.io/0';

describe('buildSentryOptions', () => {
  it('enables Sentry when a DSN is set', () => {
    const options = buildSentryOptions({ dsn: DSN, isDev: false });
    expect(options.enabled).toBe(true);
    expect(options.dsn).toBe(DSN);
  });

  it('disables Sentry without a DSN', () => {
    expect(buildSentryOptions({ dsn: undefined, isDev: true }).enabled).toBe(false);
    expect(buildSentryOptions({ dsn: '   ', isDev: true }).enabled).toBe(false);
  });

  it('tags the environment and samples traces only in release', () => {
    expect(buildSentryOptions({ dsn: DSN, isDev: true })).toMatchObject({
      environment: 'development',
      tracesSampleRate: 1,
    });
    expect(buildSentryOptions({ dsn: DSN, isDev: false })).toMatchObject({
      environment: 'production',
      tracesSampleRate: 0.2,
    });
  });

  it('never attaches screenshots or personal data', () => {
    expect(buildSentryOptions({ dsn: DSN, isDev: false })).toMatchObject({
      attachScreenshot: false,
      attachViewHierarchy: false,
      sendDefaultPii: false,
    });
  });
});
