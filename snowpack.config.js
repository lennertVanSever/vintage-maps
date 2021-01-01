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
  ],
  exclude: ['cities/**/*'],
};
