module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Alias de rutas absolutas — debe coincidir con tsconfig.json paths
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@dominio': './src/dominio',
            '@componentes': './src/componentes',
            '@hooks': './src/hooks',
            '@pantallas': './src/pantallas',
            '@store': './src/store',
            '@assets': './assets',
            '@tipos-compartidos':
              '../../packages/tipos-compartidos/src/index.ts',
          },
        },
      ],
      // Necesario para react-native-reanimated (siempre al final)
      'react-native-reanimated/plugin',
    ],
  };
};
