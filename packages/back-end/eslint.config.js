import base from '../../eslint.base.js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import boundaries from 'eslint-plugin-boundaries'

export default [
  base,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      boundaries,
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'src/domain', allow: [] },
            { from: 'src/app', allow: ['src/domain'] },
            { from: 'src/infra', allow: ['src/app', 'src/domain'] },
          ],
        },
      ],
    },
  },
]
