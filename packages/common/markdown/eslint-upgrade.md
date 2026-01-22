# ESLint 升級與配置總結

## 📦 已安裝的套件

### 在 xo-c 和 xo-b 包中安裝了以下開發依賴：

- **eslint-plugin-simple-import-sort** (^12.1.1) - 自動排序 import/export 語句
- **eslint-plugin-import** (^2.29.1) - 檢查 import/export 規範和循環引用
- **eslint-plugin-unicorn** (^62.0.0) - 現代化最佳實踐（100+規則）
- **eslint-plugin-sonarjs** (^3.0.5) - 代碼異味檢查，防止邏輯陷阱
- **@typescript-eslint/eslint-plugin** (^8.48.0) - TypeScript ESLint 支持

---

## ✨ 啟用的核心功能

### 1️⃣ 強制 Import/Export 順序
**規則**: `simple-import-sort/imports` 和 `simple-import-sort/exports`
- 自動排序導入語句（內建模塊 > 第三方庫 > 本地路徑）
- 按下保存後自動格式化
- **級別**: error（建立過程中必須修復）

### 2️⃣ 強制函數回傳值類型
**規則**: `@typescript-eslint/explicit-function-return-type`
- 所有公開函數必須標註回傳類型
- 箭頭函數需標明類型：`const fn = (): string => "hello"`
- **級別**: warn（允許代碼編譯）

### 3️⃣ 邏輯複雜度限制
**規則**: 
- `complexity` - 單個函數最多 10 條邏輯分支
- `max-depth` - 嵌套層級最多 3 層
- `max-lines-per-function` - 單個函數不超過 50 行
- **級別**: warn（提醒重構建議）

### 4️⃣ 防止循環引用
**規則**: `import/no-cycle`
- 檢測並阻止模組間互相引用
- 防止難解的依賴 Bug
- **級別**: error

### 5️⃣ Unicorn 現代化最佳實踐
**部分啟用的規則**:
- `no-array-reduce` - 建議用其他迴圈替代
- `no-array-sort` - 建議使用 `Array#toSorted()`
- `no-null` - 建議用 `undefined` 代替 `null`
- `prevent-abbreviations` - 建議使用完整變數名
- **級別**: warn（代碼風格建議）

### 6️⃣ SonarJS 代碼異味檢查
**部分啟用的規則**:
- `todo-tag` - 提醒未完成的 TODO 註釋
- `pseudo-random` - 警告偽隨機數生成
- `no-hardcoded-passwords` - 檢測硬編碼的密碼
- `no-invariant-returns` - 檢測總是回傳相同值的函數
- **級別**: warn（代碼質量警告）

---

## 🚀 執行結果

### xo-c 包
```
✖ 59 problems (0 errors, 59 warnings)
✅ 所有錯誤自動修復
✅ Import 順序已自動排序
```

### xo-b 包
```
✖ 117 problems (0 errors, 117 warnings)
✅ 所有錯誤自動修復
✅ Import 順序已自動修復
```

---

## 📝 配置檔案

### xo-c 配置 (`eslint.config.js`)
- 應用了 Boundaries 架構檢查
- 集成了 simple-import-sort、unicorn 和 sonarjs
- 針對測試檔案調整了規則

### xo-b 配置 (`eslint.config.mjs`)
- 基於 TypeScript ESLint 的推薦配置
- 集成了 simple-import-sort、unicorn 和 sonarjs
- Prettier 格式化集成

---

## 🎯 後續建議

1. **修復回傳類型警告**
   - 逐步為所有函數添加回傳類型註解
   - 這將提升代碼的可讀性和類型安全性

2. **優化複雜度**
   - 重構超過 50 行或複雜度超過 10 的函數
   - 可以提升測試覆蓋率和可維護性

3. **替換 `null` 為 `undefined`**
   - 建議在新代碼中使用 `undefined`
   - 保持代碼風格一致

4. **解決循環引用**
   - 檢查是否有不應存在的循環依賴
   - 重新組織模組結構

---

## 🔧 常用命令

```bash
# 在 xo-c 包執行 lint
cd packages/xo-c
pnpm run lint

# 自動修復 linting 問題
pnpm run lint:fix

# 在 xo-b 包執行 lint
cd ../xo-b
pnpm run lint:fix
```

---

## 📊 規則強度配置

| 規則類別 | 強度設定 | 說明 |
|---------|--------|------|
| Import 排序 | error | 必須符合 |
| 循環引用 | error | 必須符合 |
| 回傳類型 | warn | 建議符合 |
| 複雜度 | warn | 建議優化 |
| 代碼風格 | warn | 參考建議 |

---

**配置完成時間**: 2026-01-23
**配置者**: GitHub Copilot
