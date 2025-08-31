module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
  },
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/'],
};