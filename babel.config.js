module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      helpers: true,
      regenerator: false
    }],
    // import.meta 변환 플러그인 추가
    ['@babel/plugin-syntax-import-meta']
  ]
};
