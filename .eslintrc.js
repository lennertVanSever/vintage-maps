module.exports = {
  extends: ['@borealisgroup'],
  parser: "babel-eslint",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2021,
    sourceType: "module"
  },
  globals: {
    d3: true,
    Stripe: true
  },
  overrides: [
    {
      files: ["scripts/**/*"],
      rules: {
        "import/extensions": 0,
        "max-classes-per-file": 0
      }
    }
  ],
};
