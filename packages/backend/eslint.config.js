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
          // 領域層：業務邏輯核心
          type: 'domain',
          pattern: 'src/domain/**/*',
        },
        {
          // 應用層：業務流程協調
          type: 'app',
          pattern: 'src/app/**/*',
        },
        {
          // 基礎設施層：外部依賴實現
          type: 'infra',
          pattern: 'src/infra/**/*',
        },
      ],
    },
    // rules: {
    //   // 應用 boundaries 推薦規則
    //   ...boundaries.configs.recommended.rules,
    //   // 自訂架構依賴規則
    //   'boundaries/element-types': [
    //     2, // 錯誤級別
    //     {
    //       // 預設禁止所有依賴
    //       default: 'disallow',
    //       rules: [
    //         // 領域層只能依賴領域層內部
    //         { from: 'domain', allow: ['domain'] },
    //         // 應用層只能依賴領域層
    //         { from: 'app', allow: ['domain'] },
    //         // 基礎設施層可以依賴應用層和領域層
    //         { from: 'infra', allow: ['app', 'domain'] },
    //       ],
    //     },
    //   ],
    // },
  },
]
