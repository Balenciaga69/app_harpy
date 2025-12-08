# Attribute System 模組規格書

## 目標功能與範圍

### 會實現的功能

- 管理角色基礎屬性值
- 管理屬性修飾器的添加與移除
- 計算最終屬性值（基礎值 + 修飾器）
- 支援修飾器優先級排序
- 支援加法與乘法兩種修飾模式
- 屬性值驗證與限制
- 作為戰鬥內外共用的核心計算邏輯

### 不會實現的功能

- 屬性類型定義（由 domain/attribute 負責）
- 戰鬥事件觸發（由 Combat Engine 負責）
- Effect 系統（由 Effect 模組負責）
- UI 顯示（由 UI 模組負責）
- 存讀檔（由 PersistentStorage 模組負責）

---

## 架構與元件關係

### 模組定位

位於共享層（shared/attribute-system），提供純邏輯的屬性計算功能，無外部依賴，可被戰鬥內外使用。

### 依賴方向

- 僅依賴 domain/attribute 的基礎類型定義
- 被 Combat Engine 使用（戰鬥內計算）
- 被 CharacterModifierSystem 使用（戰鬥外面板）
- 被 UI 模組使用（顯示屬性資訊）

### 檔案結構

- AttributeManager.ts 管理基礎值與修飾器集合
- AttributeCalculator.ts 執行屬性計算邏輯
- models/attribute-modifier.ts 定義修飾器介面與優先級
- models/attribute-calculator.ts 定義計算器介面
- index.ts 統一導出

---

## 核心元件

### AttributeManager

管理角色的基礎屬性值與修飾器清單。提供添加、移除修飾器的方法，並確保屬性值在合法範圍內。

### AttributeCalculator

執行屬性計算邏輯。依優先級排序修飾器，分離加法與乘法修飾器，套用公式計算最終值。

計算公式：（基礎值 + Σ加法修飾器） × Π（1 + 乘法修飾器）

### AttributeModifier

定義屬性修飾器的資料結構，包含類型、數值、模式（加法或乘法）、來源等資訊。

### ModifierPriority

定義修飾器的執行優先級，確保計算順序正確。包含五個等級：LOWEST、LOW、NORMAL、HIGH、HIGHEST。

---

## 對外暴露的主要功能

### 類別導出

- AttributeManager 屬性管理器
- AttributeCalculator 屬性計算器

### 類型導出

- IAttributeCalculator 計算器介面
- AttributeModifier 修飾器介面
- AttributeModifierEx 擴展修飾器介面（含優先級）
- ModifierPriorityType 優先級類型

### 常數導出

- ModifierPriority 優先級定義

### 重新導出

- AttributeType、BaseAttributeValues 從 domain/attribute
- createDefaultAttributes、AttributeDefaults、AttributeLimits 從 domain/attribute

---

## 使用場景

### 戰鬥內使用

Combat Engine 建立 Character 時，使用 AttributeManager 管理屬性，使用 AttributeCalculator 計算即時屬性值。Effect 透過 addAttributeModifier 動態調整屬性。

### 戰鬥外使用

CharacterModifierSystem 使用相同的計算邏輯，從裝備與遺物的 Effect 中提取修飾器，計算角色面板屬性。確保戰鬥內外結果一致。

### 單元測試

可獨立測試 AttributeManager 與 AttributeCalculator，無需啟動完整戰鬥系統。

---

## 設計原則

### 單一職責

AttributeManager 僅負責資料管理，AttributeCalculator 僅負責計算邏輯，職責清晰分離。

### 無副作用

所有方法皆為純函數或資料操作，無全局狀態依賴，易於測試與推理。

### 跨語言可移植

無框架耦合，純 TypeScript 邏輯，可直接轉譯為 C#、Python、Go 等語言。

### 向後兼容

保留 combat/domain/attribute 的導出路徑，既有代碼無需立即修改。
