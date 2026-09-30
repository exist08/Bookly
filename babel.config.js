module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@constants': './src/constants',
          '@services': './src/services',
          '@types': './src/types',
          '@utils': './src/utils',
          '@assets': './src/assets',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};