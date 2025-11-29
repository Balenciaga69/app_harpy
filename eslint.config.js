import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'build/**', '*.config.js'],
  },

  // JavaScript 基礎配置
  js.configs.recommended,

  // TypeScript 和 React 文件配置
  {
    files: ['src/**/*.{ts,tsx,js,jsx}', 'vite.config.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
      prettier,
      'jsx-a11y': jsxA11y,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // JavaScript/TypeScript 基礎規則
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // 讓 TypeScript 處理
      'prefer-const': 'error',
      'no-var': 'error',

      // TypeScript 規則
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',

      // React 規則
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要
      'react/prop-types': 'off', // TypeScript 已處理
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/no-unescaped-entities': 'warn',

      // React Hooks 規則
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn', // 建議開啟，幫助發現依賴問題

      // React Refresh (Vite HMR)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // 可訪問性規則 (基礎)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      // Prettier (建議用 warn 而不是 error)
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'auto', // 處理不同系統的換行符
        },
      ],
    },
  },

  // 針對配置文件的特殊規則
  {
    files: ['*.config.{ts,js}', 'vite.config.ts'],
    rules: {
      'no-console': 'off',
    },
  },
]
