// 導入基礎 ESLint 配置
import base from '../../eslint.base.js' // 導入 monorepo 共用 ESLint 設定
import tseslint from '@typescript-eslint/eslint-plugin' // TypeScript ESLint 插件
import tsParser from '@typescript-eslint/parser' // TypeScript 解析器
import boundaries from 'eslint-plugin-boundaries' // 架構邊界檢查插件

export default [
  base, // 應用共用 ESLint 設定
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'], // 只針對 src 下 ts/tsx 檔案
    languageOptions: {
      parser: tsParser, // 使用 TypeScript 解析器
      parserOptions: {
        project: ['./tsconfig.json'], // 指定 tsconfig 路徑
        // tsconfigRootDir: __dirname, // [可選] 指定 tsconfig 根目錄
        // ecmaVersion: 2022, // [可選] ECMAScript 版本
        // sourceType: 'module', // [可選] 指定模組系統
      },
    },
    plugins: {
      '@typescript-eslint': tseslint, // TypeScript ESLint 插件
      boundaries, // 架構邊界檢查
      // simpleImportSort, // [可選] 自動排序 import
      // sonarjs, // [可選] 異味代碼檢查
      // 'unused-imports', // [可選] 自動清理未用 import
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true, // 解析 @types 資料夾
          project: './tsconfig.json', // 指定 tsconfig 路徑
        },
        // node: { extensions: ['.js', '.ts'] }, // [可選] 支援 node 解析
      },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**/*' }, // domain 層
        { type: 'application', pattern: 'src/application/**/*' }, // application 層
        { type: 'infra', pattern: 'src/infra/**/*' }, // infra 層
        { type: 'shared', pattern: 'src/shared/**/*' }, // shared 層
        { type: 'data', pattern: 'src/data/**/*' }, // data 層
      ],
      'boundaries/ignore': ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts'], // 忽略測試與型別檔
      // 'import/extensions': ['.js', '.ts'], // [可選] 支援副檔名
    },
    rules: {
      ...boundaries.configs.recommended.rules, // 套用 boundaries 推薦規則
      'boundaries/no-private': 'off', // 關閉 private 限制（允許同 feature 內引用）
      'boundaries/element-types': [
        2, // 錯誤級別 2=error
        {
          default: 'disallow', // 預設禁止跨層依賴
          rules: [
            { from: ['domain'], allow: ['domain', 'shared'] }, // domain 只能依賴 domain/shared
            { from: ['application'], allow: ['application', 'domain', 'shared'] }, // application 可依賴 application/domain/shared
            { from: ['infra'], allow: ['application', 'domain', 'shared', 'infra', 'data'] }, // infra 可依賴所有層
            { from: ['shared'], allow: ['shared'] }, // shared 只能依賴 shared
            { from: ['data'], allow: ['data', 'domain', 'application', 'shared'] }, // data 只能依賴 data/domain/application/shared
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts'], // 針對測試檔案
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // 測試中允許使用 any
      'sonarjs/no-duplicate-string': 'off', // 測試中允許重複字串
    },
  },
]
