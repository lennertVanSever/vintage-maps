module.exports = {
  plugins: [
    [
      '@snowpack/plugin-babel',
      {
        transformOptions: {
          plugins: ['@babel/plugin-proposal-class-properties'],
        },
      },
    ],
    ['babel-plugin-inline-json-import'],
  ],
  devOptions: {
    hmr: false,
  },
  exclude: ['cities/**/*'],
};
