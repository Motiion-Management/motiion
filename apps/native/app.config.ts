import { ConfigContext, ExpoConfig } from 'expo/config';

const APP_VARIANT_CONFIGS = {
  development: {
    name: 'Motiion Dev',
    scheme: 'motiion-dev',
    bundleIdentifier: 'io.motiion.dev',
    icon: './assets/icon-dev.png',
    adaptiveIcon: './src/assets/store/adaptive-icon-dev.png',
  },

  production: {
    name: 'Motiion',
    scheme: 'motiion',
    bundleIdentifier: 'io.motiion.motiion',
    icon: './assets/icon.png',
  },
} as const;

const getAppVariantConfig = (variant: keyof typeof APP_VARIANT_CONFIGS | string) => {
  switch (variant) {
    case 'dev':
    case 'development':
      return APP_VARIANT_CONFIGS.development;
    case 'production':
    default:
      return APP_VARIANT_CONFIGS.production;
  }
};

export default ({ config }: ConfigContext) => {
  const { name, scheme, icon, bundleIdentifier } = getAppVariantConfig(
    process.env.APP_VARIANT || 'production'
  );

  return {
    ...config,
    name,
    icon,
    scheme,
    ios: {
      ...config.ios,
      bundleIdentifier,
    },
    android: {
      ...config.android,
      package: bundleIdentifier,
    },
  } as ExpoConfig;
};
