const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  resolver: {
    unstable_enablePackageExports: false,
    platforms: ['ios', 'android', 'native', 'web'],
  },
  transformer: {
    // Hermes 호환을 위한 설정
    hermesParser: true,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
