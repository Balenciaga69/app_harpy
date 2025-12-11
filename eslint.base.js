export default {
  ignores: [
    'dist/**',
    'build/**',
    'node_modules/**',
    'packages/*/dist/**',
    'packages/*/build/**',
    'packages/*/node_modules/**',
    '*.config.js',
  ],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
}
