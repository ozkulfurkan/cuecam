// Sentry's Expo config adds debug IDs to bundles so release stack traces can be
// matched to the source maps uploaded during EAS builds.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
