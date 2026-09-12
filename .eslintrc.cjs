/* ESLint 8 (legacy config) with TypeScript-aware rules.

 * Feature-boundary enforcement:
 *   src/shared/**        may NEVER import src/features/**
 *   src/features/household/** + its entrypoints may NEVER import the collector feature
 *   src/features/collector/** + its entrypoints may NEVER import the household feature
 *
 * These are the hard guardrails that keep the two app bundles decoupled.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    'android/**',
    'ios/**',
    '*.config.ts',
    'postcss.config.js',
    'tailwind.config.js',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', args: 'after-used' },
    ],
    'no-restricted-imports': 'off',
  },
  overrides: [
    {
      /* shared code is app-agnostic — it cannot reach into any feature */
      files: ['src/shared/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/features/**'],
                message: 'src/shared/** must not import from src/features/**.',
              },
            ],
          },
        ],
      },
    },
    {
      /* household build and its entrypoints are collector-free */
      files: ['src/features/household/**/*.{ts,tsx}', 'src/App.household.*', 'src/main.household.*'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/features/collector/**', '**/App.collector.*', '**/main.collector.*'],
                message: 'Household code must not import from the collector feature.',
              },
            ],
          },
        ],
      },
    },
    {
      /* collector build and its entrypoints are household-free */
      files: ['src/features/collector/**/*.{ts,tsx}', 'src/App.collector.*', 'src/main.collector.*'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/features/household/**', '**/App.household.*', '**/main.household.*'],
                message: 'Collector code must not import from the household feature.',
              },
            ],
          },
        ],
      },
    },
  ],
};