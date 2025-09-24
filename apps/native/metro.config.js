// Learn more https://docs.expo.dev/guides/monorepos

/** @type {import('expo/metro-config').MetroConfig} */
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// eslint-disable-next-line no-undef
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const globalCSS = path.resolve(projectRoot, 'global.css');
const config = getDefaultConfig(projectRoot, {
  isCSSEnabled: true,
});

// #1 - Watch all files in the monorepo
config.watchFolders = [workspaceRoot];
// #3 - Force resolving nested modules to the folders below
config.resolver.disableHierarchicalLookup = true;
// #2 - Try resolving with project modules first, then workspace modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// config.resolver.unstable_enableSymlinks = true

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({
    root: path.join(projectRoot, 'node_modules', '.cache', 'metro'),
  }),
];

const withNativewindConfig = withNativeWind(config, {
  input: globalCSS,
  inlineRem: 16,
});

withNativewindConfig.transformer = {
  ...withNativewindConfig.transformer,
  _expoRelativeProjectRoot: projectRoot,
};

module.exports = withNativewindConfig;
