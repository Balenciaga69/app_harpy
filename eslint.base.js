import eslintPluginImport from 'eslint-plugin-import'

export default {
  ignores: [
    'dist/**',
    'build/**',
    'node_modules/**',
    'packages/*/dist/**',
    'packages/*/build/**',
    'packages/*/node_modules/**',
    '*.config.js',
    'depr/**',
  ],
  plugins: {
    import: eslintPluginImport,
  },
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./packages/*/tsconfig.json', './tsconfig.base.json'],
      },
    },
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'import/no-cycle': ['error', { maxDepth: '∞' }],
    'import/no-unresolved': 'error',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        alphabeticalOrder: true,
      },
    ],
  },
}

