## 簡介

CharacterSheetCalculator（角色屬性面板計算器）是一個負責計算角色最終屬性面板的模組。它將基於角色的基礎屬性、裝備詞綴、遺物效果，生成靜態的屬性數據，供 UI 展示使用。

**實作狀態：已完成**

最後更新時間：2025/12/10

## 輸入與輸出

### 輸入

- 角色的基礎屬性值（BaseAttributeValues）
- 裝備實例列表（IEquipmentInstance[]）及其詞綴
- 遺物實例列表（IRelicInstance[]）及其堆疊數量

### 輸出

- 角色屬性面板快照（ICharacterSheet），包含所有屬性的最終值和基礎值

## 元件盤點

### 已實作元件

- CharacterSheetCalculator：主計算器，整合所有處理器並使用 AttributeManager 計算最終屬性
- EquipmentProcessor：解析裝備實例的詞綴並轉換為屬性修飾器
- RelicProcessor：解析遺物實例並轉換為屬性修飾器（支援動態計算）
- AFFIX_ATTRIBUTE_MAPPINGS：詞綴屬性映射註冊表
- RELIC_ATTRIBUTE_MAPPINGS：遺物屬性映射註冊表

### 設計亮點

- 使用映射表機制將詞綴/遺物轉換為 AttributeModifier，與戰鬥系統的 Effect 解耦
- 複用現有的 AttributeManager 和 AttributeCalculator，確保計算邏輯一致
- 支援複雜的遺物計算（如基於 HP 的護甲轉換）

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- src/domain/item：提供裝備與遺物的實例介面
- src/logic/attribute-system：提供屬性計算與管理邏輯（複用 AttributeManager 和 AttributeCalculator）
- src/domain/attribute：提供屬性類型定義

### 被依賴的模組

- UI 層（未來）：角色面板顯示功能
- 背包系統（未來）：裝備預覽功能

## 核心解決方案

### 靜態 vs 動態的分離

- **戰鬥內**：使用 Effect 系統，支援動態觸發、Buff、異常狀態等
- **戰鬥外**：使用 CharacterSheetCalculator，僅計算固定屬性增益

### 映射表機制

- 避免靜態計算依賴戰鬥上下文（ICombatContext）
- 將詞綴/遺物的效果定義與戰鬥邏輯解耦
- 新增內容時僅需更新映射表，不影響核心邏輯

## 未來擴展

- 支援更多詞綴和遺物的屬性映射
- 整合到角色管理系統中，提供完整的角色數據服務
- 可考慮將映射表抽離為配置檔案（JSON），提升可維護性
