// 導入基礎 ESLint 配置
import base from '../../eslint.base.js'
// 導入 TypeScript ESLint 插件和解析器
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
// 導入 React 相關插件
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
// 導入代碼格式化插件
import prettier from 'eslint-plugin-prettier'
// 導入無障礙訪問檢查插件
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  // 應用基礎配置
  base,
  {
    // 適用於前端文件（TypeScript 和 JavaScript）
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      // 使用 TypeScript 解析器
      parser: tsParser,
      parserOptions: {
        // 指定 TypeScript 項目配置文件
        project: ['./tsconfig.json'],
        // 啟用 JSX 功能
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      // React 核心插件
      react,
      // React Hooks 檢查插件
      'react-hooks': reactHooks,
      // React Fast Refresh 檢查插件
      'react-refresh': reactRefresh,
      // TypeScript ESLint 插件
      '@typescript-eslint': tseslint,
      // Prettier 格式化檢查插件
      prettier,
      // JSX 無障礙訪問檢查插件
      'jsx-a11y': jsxA11y,
    },
    settings: {
      // 自動檢測 React 版本
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 基本 JavaScript 規則
      'no-console': 'warn', // 警告使用 console
      'no-debugger': 'warn', // 警告使用 debugger
      'prefer-const': 'error', // 強制使用 const
      'no-var': 'error', // 禁止使用 var

      // React 相關規則
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要導入 React
      'react/prop-types': 'off', // 使用 TypeScript 時關閉 prop-types 檢查
      'react/jsx-uses-react': 'off', // React 17+ 不需要此檢查
      'react/jsx-uses-vars': 'error', // 確保 JSX 中使用的變數被正確宣告
      'react/jsx-key': 'error', // 強制在列表中提供 key
      'react/jsx-no-duplicate-props': 'error', // 禁止重複的 JSX props
      'react/jsx-no-undef': 'error', // 確保 JSX 元素被正確定義
      'react/no-unescaped-entities': 'warn', // 警告未轉義的實體字符

      // React Hooks 規則
      'react-hooks/rules-of-hooks': 'error', // 強制正確使用 Hooks
      'react-hooks/exhaustive-deps': 'warn', // 檢查依賴項是否完整

      // React Fast Refresh 規則
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }], // 只導出組件以支持熱重載

      // 無障礙訪問規則
      'jsx-a11y/alt-text': 'warn', // 圖片需要 alt 文字
      'jsx-a11y/anchor-has-content': 'warn', // 鏈接需要內容
      'jsx-a11y/anchor-is-valid': 'warn', // 鏈接需要有效 href
      'jsx-a11y/click-events-have-key-events': 'warn', // 可點擊元素需要鍵盤事件
      'jsx-a11y/no-static-element-interactions': 'warn', // 靜態元素不應有互動事件

      // Prettier 格式化規則
      'prettier/prettier': ['warn', { endOfLine: 'auto' }], // 自動行尾格式
    },
  },
]
