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
      // 配置模組解析器, 支持 TypeScript 路徑映射
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
          pattern: 'src/domain/**/*',
        },
        {
          type: 'application',
          pattern: 'src/application/**/*',
        },
        {
          type: 'infra',
          pattern: 'src/infra/**/*',
        },
        {
          type: 'shared',
          pattern: 'src/shared/**/*',
        },
        {
          type: 'data',
          pattern: 'src/data/**/*',
        },
      ],
      // 定義 feature 邊界識別規則
      'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'],
    },
    rules: {
      // 應用 boundaries 推薦規則
      ...boundaries.configs.recommended.rules,
      // 禁用 no-private 規則 (允許同 feature 內引用)
      'boundaries/no-private': 'off',
      // 自訂架構依賴規則 (嚴格模式)
      'boundaries/element-types': [
        2, // 錯誤級別
        {
          default: 'disallow',
          rules: [
            // domain: 只能引用 domain 和 shared
            {
              from: ['domain'],
              allow: ['domain', 'shared'],
            },
            // application: 可引用 application, domain, shared
            {
              from: ['application'],
              allow: ['application', 'domain', 'shared'],
            },
            // infra: 可引用所有層（因為要實作各層）
            {
              from: ['infra'],
              allow: ['application', 'domain', 'shared', 'infra', 'data'],
            },
            // shared: 只能引用 shared
            {
              from: ['shared'],
              allow: ['shared'],
            },
            // data: 只能引用 data 和 shared
            {
              from: ['data'],
              allow: ['data', 'domain', 'application', 'shared'],
            },
          ],
        },
      ],
    },
  },
]
