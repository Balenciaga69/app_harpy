# Attribute-System 模組規格說明

## 簡介

Attribute-System 模組負責遊戲中的屬性管理和計算邏輯，包括基礎屬性儲存、修飾器應用和最終值計算。模組採用優先級排序和加法/乘法分離計算，支援動態屬性調整，確保屬性系統的準確性和靈活性。最後更新時間：2025/12/09。

## 輸入與輸出

### 輸入

- 基礎屬性配置（BaseAttributeValues）：角色的初始屬性值
- 屬性修飾器（AttributeModifier）：包含 ID、類型、數值、模式和來源的修飾器
- 屬性類型查詢（AttributeType）：指定要計算的屬性類型

### 輸出

- 最終屬性值（number）：應用所有修飾器後的計算結果
- 基礎屬性值（number）：不含修飾器的原始值
- 修飾器列表（AttributeModifier[]）：指定屬性的所有修飾器

## 元件盤點

### 核心元件

- AttributeManager：屬性管理器，負責儲存基礎屬性值和修飾器，提供添加、移除和查詢功能。
- AttributeCalculator：屬性計算器，實現最終屬性值的計算邏輯，支援優先級排序和加法/乘法分離。

### 模型元件

- AttributeModifier：屬性修飾器介面，定義修飾器的結構，包括 ID、類型、數值、模式和來源。
- AttributeModifierEx：擴展修飾器介面，包含優先級資訊。
- ModifierPriority：修飾器優先級常量，定義不同的執行順序等級。
- ModifierPriorityType：優先級類型定義。

### 介面元件

- IAttributeCalculator：屬性計算器介面，定義計算方法的契約。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- domain/attribute：屬性定義，依賴 AttributeType、BaseAttributeValues 和 AttributeLimits 進行屬性管理

### 被依賴的模組

- logic/combat：戰鬥系統，依賴屬性計算進行傷害、護甲和閃避計算
- domain/character：角色定義，依賴屬性管理建立角色實例
- UI 層：屬性顯示，依賴屬性值進行介面渲染
- logic/item-generator：物品生成器，依賴屬性系統應用物品效果
