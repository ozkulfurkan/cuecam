import { ConfigContext, ExpoConfig } from 'expo/config';

const BUNDLE_ID = 'com.ozkulfurkan.cuecam';
const EAS_PROJECT_ID = '94218dda-82ec-427f-8f8c-1017420af340';

// Native config cannot import from src/theme (app.config.ts is evaluated by Node
// without the app's module aliases), so this mirrors darkPalette.background there.
const BACKGROUND = '#0B0B0F';

// Permission prompts. English is the base language; Turkish comes from `locales`.
// Android shows system-provided permission dialogs, so these strings are iOS-only.
const permissions = {
  en: {
    NSCameraUsageDescription: 'Cue Cam uses the camera to record you while you read your script.',
    NSMicrophoneUsageDescription: 'Cue Cam uses the microphone to record audio with your video.',
    NSPhotoLibraryAddUsageDescription:
      'Cue Cam saves your recordings to the "Prompter" album in your photo library.',
    NSPhotoLibraryUsageDescription:
      'Cue Cam accesses your photo library to save recordings to the "Prompter" album.',
  },
  tr: {
    NSCameraUsageDescription: 'Cue Cam, senaryonu okurken seni kaydetmek için kamerayı kullanır.',
    NSMicrophoneUsageDescription:
      'Cue Cam, videonla birlikte ses kaydetmek için mikrofonu kullanır.',
    NSPhotoLibraryAddUsageDescription:
      'Cue Cam, kayıtlarını fotoğraf arşivindeki "Prompter" albümüne kaydeder.',
    NSPhotoLibraryUsageDescription:
      'Cue Cam, kayıtlarını "Prompter" albümüne kaydetmek için fotoğraf arşivine erişir.',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Cue Cam',
  slug: 'cuecam',
  owner: 'ozkulfurkan',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'cuecam',
  userInterfaceStyle: 'dark',
  backgroundColor: BACKGROUND,
  ios: {
    bundleIdentifier: BUNDLE_ID,
    icon: './assets/expo.icon',
    infoPlist: {
      ...permissions.en,
      CFBundleAllowMixedLocalizations: true,
    },
  },
  android: {
    package: BUNDLE_ID,
    adaptiveIcon: {
      backgroundColor: BACKGROUND,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // VisionCamera v5 has no config plugin. iOS gets its prompts from infoPlist
    // above; Android needs the manifest entries (dialog text comes from the OS).
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
  },
  // Scoped under `ios`: unscoped keys would also become Android strings.xml entries
  // with no default-locale value, which fails Android's release lint (ExtraTranslation).
  locales: {
    tr: { ios: { ...permissions.tr, CFBundleDisplayName: 'Cue Cam' } },
  },
  web: {
    output: 'server',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    // Uploads source maps on EAS builds; the token comes from SENTRY_AUTH_TOKEN.
    ['@sentry/react-native/expo', { organization: 'ozkulfurkan', project: 'cuecam' }],
    [
      'expo-splash-screen',
      {
        backgroundColor: BACKGROUND,
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    eas: { projectId: EAS_PROJECT_ID },
  },
});
