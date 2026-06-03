// babel.config.js
module.exports = function(api) {
  api.cache(true);

  // 1. Start with the base aliases (like @assets)
  const allAliases = {
    // Map the alias @assets to the physical folder ./assets
    "@assets": "./assets", 
  };

  // 2. Add conditional aliases (like the web mock)
  if (process.env.EXPO_PUBLIC_PLATFORM === 'web' || process.env.BABEL_ENV === 'web') {
    // Merge conditional aliases into the main map
    Object.assign(allAliases, {
        'react-native/Libraries/Utilities/codegenNativeComponent': './__mocks__/rn-mock.js',
    });
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ["."],
        // 3. Use the merged map here!
        alias: allAliases, 
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }],
    ],
  };
};