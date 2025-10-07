import { ConfigContext, ExpoConfig } from 'expo/config';

const APP_VARIANT_CONFIGS = {
  development: {
    name: 'Motiion Dev',
    scheme: 'motiion-dev',
    bundleIdentifier: 'io.motiion.dev',
  },

  production: {
    name: 'Motiion',
    scheme: 'motiion',
    bundleIdentifier: 'io.motiion.motiion',
  },
} as const;

const getAppVariantConfig = (variant: keyof typeof APP_VARIANT_CONFIGS | string) => {
  switch (variant) {
    case 'development':
      return APP_VARIANT_CONFIGS.development;
    case 'production':
    default:
      return APP_VARIANT_CONFIGS.production;
  }
};

export default ({ config }: ConfigContext) => {
  const appVariant = process.env.APP_VARIANT || 'production';
  const { name, scheme, bundleIdentifier } = getAppVariantConfig(appVariant);

  const icon = `./assets/brand/${appVariant}.icon`;

  return {
    ...config,
    name,
    scheme,
    ios: {
      ...config.ios,
      icon,
      bundleIdentifier,
    },
  } as ExpoConfig;
};
