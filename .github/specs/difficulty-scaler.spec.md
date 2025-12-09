# DifficultyScaler 模組規格書

## 目標功能與範圍

### 會實現的功能

- 根據 Run 進度計算當前難度係數
- 支援關卡層數與章節數作為輸入因子
- 提供統一的難度計算公式
- 確保計算結果可重現與一致

### 不會實現的功能

- 物品生成邏輯（由 ItemGenerator 負責）
- 敵人生成邏輯（由 EnemyGenerator 負責）
- 關卡進度管理（由 Run 模組負責）
- 屬性計算（由 AttributeSystem 負責）
- 戰鬥運算（由 CombatEngine 負責）

---

## 架構與元件關係

### 模組定位

位於後端純運算模組層，提供獨立的難度計算功能，無外部依賴，可被多個模組重用。

### 依賴方向

- 不依賴任何其他模組
- 被 ItemGenerator 使用（決定物品強度）
- 被 EnemyGenerator 使用（決定敵人強度）
- 被 Run 模組使用（追蹤進度）

### 檔案結構

- DifficultyScaler.ts 核心計算邏輯類別
- index.ts 統一導出

---

## 核心元件

### DifficultyScaler

負責執行難度係數計算的類別。接受關卡層數與章節數作為參數，根據預定義公式計算並返回數值。

計算公式：基礎難度 + (層數係數 × 關卡層數) + (章節係數 × 章節數)

---

## 對外暴露的主要功能

### 類別導出

- DifficultyScaler 難度計算器

### 方法導出

- calculateDifficulty(level: number, chapter?: number): number

---

## 使用場景

### 物品生成

ItemGenerator 在生成裝備或遺物時，調用 DifficultyScaler 取得難度係數，決定詞綴強度與稀有度權重。

### 敵人生成

EnemyGenerator 在生成敵人實例時，調用 DifficultyScaler 取得難度係數，決定敵人屬性與裝備強度。

### 進度追蹤

Run 模組在推進關卡時，調用 DifficultyScaler 計算當前難度，更新進度資訊。

---

## 設計原則

### 單一職責

DifficultyScaler 僅負責難度計算邏輯，不處理其他遊戲機制。

### 無副作用

所有方法皆為純函數，相同輸入永遠返回相同輸出，無全局狀態依賴。

### 跨語言可移植

無框架耦合，純數學計算，可直接轉譯為 C#、Python、Go 等語言。

### 易於測試

簡單輸入輸出，方便撰寫單元測試驗證計算正確性。
