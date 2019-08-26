module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019
  },
  rules: {
    'linebreak-style': ['error', 'windows']
  }
};
