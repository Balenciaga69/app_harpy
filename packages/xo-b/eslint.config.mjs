// @ts-check
import eslint from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import base from '../../eslint.base.js' // 導入 monorepo 共用 ESLint 設定
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import sonarjs from 'eslint-plugin-sonarjs'
export default [
  base,
  ...tseslint.config(
    {
      ignores: ['eslint.config.mjs'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-unsafe-argument': 'warn', // 降低為警告
        '@typescript-eslint/no-unsafe-assignment': 'warn', // 降低為警告
        '@typescript-eslint/no-unsafe-call': 'warn', // 降低為警告
        '@typescript-eslint/no-unsafe-member-access': 'warn', // 降低為警告
        '@typescript-eslint/no-unsafe-return': 'warn', // 降低為警告
        '@typescript-eslint/require-await': 'warn', // 降低為警告
        // ===== 強制函數回傳值類型 =====
        '@typescript-eslint/explicit-function-return-type': [
          'warn', // 改為 warn，允許代碼編譯但會收到警告
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
        // ===== 強制 Import/Export 順序 =====
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        // ===== 邏輯複雜度限制 =====
        'complexity': ['warn', 10],
        'max-depth': ['warn', 3],
        'max-lines-per-function': ['warn', 50],
        // ===== 防止循環引用 =====
        'import/no-cycle': 'error',
        // 'import/no-unused-modules': ['warn', { unusedExports: true }], // 與 flat config 不兼容
        'no-empty': 'warn', // 降低為警告
        // ===== Unicorn 現代化最佳實踐 =====
        ...unicorn.configs.recommended.rules,
        'unicorn/filename-case': 'off', // 允許當前的命名約定
        'unicorn/prevent-abbreviations': 'warn', // 降低為警告
        'unicorn/consistent-function-scoping': 'warn', // 降低為警告
        'unicorn/no-array-reduce': 'warn', // 降低為警告
        'unicorn/no-array-sort': 'warn', // 降低為警告
        'unicorn/no-null': 'warn', // 降低為警告
        'unicorn/no-empty-file': 'warn', // 降低為警告
        'unicorn/prefer-top-level-await': 'warn', // 降低為警告
        // ===== SonarJS 程式碼異味檢查 =====
        ...sonarjs.configs.recommended.rules,
        'sonarjs/todo-tag': 'warn', // TODO 標籤降低為警告
        'sonarjs/pseudo-random': 'warn', // 偽隨機降低為警告
        'sonarjs/reduce-initial-value': 'warn', // 降低為警告
        'sonarjs/void-use': 'warn', // 降低為警告
        'sonarjs/no-hardcoded-passwords': 'warn', // 降低為警告
        'sonarjs/no-invariant-returns': 'warn', // 降低為警告
        'sonarjs/different-types-comparison': 'warn', // 降低為警告
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
      },
      plugins: {
        'simple-import-sort': simpleImportSort,
        unicorn,
        sonarjs,
      },
    }
  ),
]
