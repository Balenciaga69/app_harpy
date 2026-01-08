import eslintPluginImport from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import sonarjs from 'eslint-plugin-sonarjs'
import unusedImports from 'eslint-plugin-unused-imports'

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
    'simple-import-sort': simpleImportSort,
    sonarjs: sonarjs,
    'unused-imports': unusedImports,
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
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    // simple-import-sort
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    // sonarjs
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'warn',
    'sonarjs/no-small-switch': 'warn',
    // unused-imports
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
}
