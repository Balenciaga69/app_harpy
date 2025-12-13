// 導入基礎 ESLint 配置
import base from '../../eslint.base.js'
// 導入 TypeScript ESLint 插件和解析器
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
// 導入架構邊界檢查插件
import boundaries from 'eslint-plugin-boundaries'

export default [
  // 應用基礎配置
  base,
  {
    // 適用於 TypeScript 文件
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      // 使用 TypeScript 解析器
      parser: tsParser,
      parserOptions: {
        // 指定 TypeScript 項目配置文件
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      // TypeScript ESLint 插件
      '@typescript-eslint': tseslint,
      // 架構邊界檢查插件
      boundaries,
    },
    settings: {
      // 配置模組解析器，支持 TypeScript 路徑映射
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      // 定義架構層級元素
      'boundaries/elements': [
        {
          type: 'domain',
          pattern: ['src/**/domain/**/*', 'src/**/domain'],
        },
        {
          type: 'app',
          pattern: ['src/**/app/**/*', 'src/**/app'],
        },
        {
          type: 'infra',
          pattern: ['src/**/infra/**/*', 'src/**/infra'],
        },
        {
          type: 'interfaces',
          pattern: ['src/**/interfaces/**/*', 'src/**/interfaces'],
        },
      ],
      // 定義 feature 邊界識別規則
      'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
    },
    rules: {
      // 應用 boundaries 推薦規則
      ...boundaries.configs.recommended.rules,
      // 禁用 no-private 規則（允許同 feature 內引用）
      'boundaries/no-private': 'off',
      // 自訂架構依賴規則（嚴格模式）
      'boundaries/element-types': [
        2, // 錯誤級別
        {
          // 預設禁止所有依賴
          default: 'disallow',
          rules: [
            // domain 層：可引用 interfaces 和 domain
            {
              from: ['domain'],
              allow: ['interfaces', 'domain'],
              message: 'domain 層只能引用 interfaces 和 domain',
            },
            // interfaces 層：只能引用 interfaces（禁止引用 domain）
            {
              from: ['interfaces'],
              allow: ['interfaces'],
              message: 'interfaces 層只能引用 interfaces，不可引用 domain 或其他實作層',
            },
            // app 層：可引用 interfaces、domain 和同層的 app
            {
              from: ['app'],
              allow: ['interfaces', 'domain', 'app'],
              message: 'app 層可引用 interfaces、domain 和同層 app，禁止引用 infra',
            },
            // infra 層：可引用 interfaces、domain 和同層的 infra
            {
              from: ['infra'],
              allow: ['interfaces', 'domain', 'infra'],
              message: 'infra 層可引用 interfaces、domain 和同層 infra，禁止引用 app',
            },
          ],
        },
      ],
    },
  },
]
