const path = require('path');

// Sentry's Expo config adds debug IDs to bundles so release stack traces can be
// matched to the source maps uploaded during EAS builds.
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// The generated native projects (android/, ios/) hold tens of thousands of build
// files and no JS. Watching them makes Metro hang for minutes after each native
// build, so keep them out. Only the project-root folders are excluded; packages'
// own android/ios folders inside node_modules are untouched.
const escape = (dir) => path.resolve(__dirname, dir).replace(/[/\\]/g, '[/\\\\]');
const nativeProjects = ['android', 'ios'].map((dir) => new RegExp(`^${escape(dir)}[/\\\\]`));

const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...nativeProjects,
];

module.exports = config;
