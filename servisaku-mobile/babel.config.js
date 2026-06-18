module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated v4 ships its Babel plugin via react-native-worklets.
      // Must be listed last.
      'react-native-worklets/plugin',
    ],
  };
};
