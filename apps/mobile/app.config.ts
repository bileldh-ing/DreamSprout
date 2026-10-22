import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const suffix = IS_DEV ? '.dev' : IS_PREVIEW ? '.preview' : '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? 'DreamSprout (Dev)' : IS_PREVIEW ? 'DreamSprout (Preview)' : 'DreamSprout Stories',
  slug: 'dreamsprout-stories',
  owner: process.env.EXPO_OWNER || undefined,
  version: '1.0.0',
  orientation: 'default',
  icon: './assets/images/icon.png',
  scheme: 'dreamsprout',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0b0f24',
  ios: {
    bundleIdentifier: `com.dreamsprout.stories${suffix}`,
    buildNumber: '1',
    supportsTablet: true,
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      UIBackgroundModes: [],
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
      ],
    },
  },
  android: {
    package: `com.dreamsprout.stories${suffix}`,
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundColor: '#1a1f4b',
    },
    // Kids app: no dangerous permissions at all.
    permissions: [],
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.READ_CONTACTS',
      'com.google.android.gms.permission.AD_ID',
    ],
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
    name: 'DreamSprout Stories',
    shortName: 'DreamSprout',
    themeColor: '#0b0f24',
    backgroundColor: '#0b0f24',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0b0f24',
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
      },
    ],
    ['expo-audio', { microphonePermission: false }],
    'expo-localization',
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: process.env.EAS_PROJECT_ID ? { url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}` } : undefined,
  runtimeVersion: { policy: 'appVersion' },
  extra: {
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
    router: {},
  },
});
