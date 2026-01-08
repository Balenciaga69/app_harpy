// 導入各種 ESLint 插件
import eslintPluginImport from 'eslint-plugin-import' // 檢查 import 相關問題
import simpleImportSort from 'eslint-plugin-simple-import-sort' // 自動排序 import
import sonarjs from 'eslint-plugin-sonarjs' // 檢查異味代碼（重複、複雜度等）
import unusedImports from 'eslint-plugin-unused-imports' // 自動偵測未使用的 import/變數

export default {
  // 忽略檢查的檔案/資料夾
  ignores: [
    'dist/**', // 編譯輸出
    'build/**', // 編譯輸出
    'node_modules/**', // 套件資料夾
    'packages/*/dist/**', // 各 package 的編譯輸出
    'packages/*/build/**', // 各 package 的編譯輸出
    'packages/*/node_modules/**', // 各 package 的套件資料夾
    '*.config.js', // 設定檔
    'depr/**', // 棄用資料夾
  ],
  plugins: {
    import: eslintPluginImport, // import 檢查
    'simple-import-sort': simpleImportSort, // import 排序
    sonarjs: sonarjs, // 代碼異味檢查
    'unused-imports': unusedImports, // 未使用 import/變數
  },
  languageOptions: {
    ecmaVersion: 'latest', // ECMAScript 最新語法
    sourceType: 'module', // 使用 ES 模組
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // 解析 @types 型別
        project: ['./packages/*/tsconfig.json', './tsconfig.base.json'], // 指定 TypeScript 設定檔
      },
    },
  },
  rules: {
    // 基本 JS 規則
    'no-console': 'warn', // 警告使用 console
    'no-debugger': 'warn', // 警告使用 debugger
    'prefer-const': 'error', // 強制使用 const
    'no-var': 'error', // 禁止使用 var

    // import 相關規則
    'import/no-cycle': ['error', { maxDepth: '∞' }], // 禁止 import 迴圈依賴
    'import/no-unresolved': 'error', // 禁止找不到的 import
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], // import 分組排序
        alphabetize: { order: 'asc', caseInsensitive: true }, // import 按字母排序
      },
    ],

    // TypeScript 規則
    '@typescript-eslint/explicit-function-return-type': 'warn', // 強制函式回傳型別
    '@typescript-eslint/no-explicit-any': 'warn', // 禁止 any

    // simple-import-sort 規則
    'simple-import-sort/imports': 'warn', // import 排序
    'simple-import-sort/exports': 'warn', // export 排序

    // sonarjs 規則（異味代碼）
    'sonarjs/no-duplicate-string': 'warn', // 禁止重複字串
    'sonarjs/no-identical-functions': 'warn', // 警告重複函式
    'sonarjs/no-small-switch': 'warn', // 警告過小的 switch

    // unused-imports 規則（未使用）
    'unused-imports/no-unused-imports': 'warn', // 自動清理未用 import
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ], // 自動清理未用變數
  },
}
