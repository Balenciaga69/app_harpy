# Attribute 模組

## 簡介

Attribute 模組負責管理角色的屬性系統，包括基礎屬性值、修飾器應用和最終屬性計算。支援加法和乘法修飾器，並提供優先級排序。最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- BaseAttributeValues：基礎屬性值，用於初始化角色屬性。
- AttributeModifier：屬性修飾器，包含值、模式和來源。

### 主要輸出

- 計算後的屬性值：應用修飾器後的數值。
- 修飾器列表：特定屬性的所有修飾器。
- 屬性狀態：基礎值和修飾器的組合。

## 元件盤點

- AttributeCalculator：屬性計算器，處理修飾器的排序和應用邏輯。
- AttributeManager：屬性管理器，管理基礎值和修飾器的增刪查改。
- AttributeConstants：屬性常數，定義預設值和限制範圍。
- AttributeValues：屬性值介面，提供基礎屬性結構和預設創建函數。
- AttributeModifier：修飾器介面，定義修飾器的結構和優先級。
- AttributeType：屬性類型定義，列出所有支援的屬性。
- 介面層：定義IAttributeCalculator和IAttributeManager契約，確保元件間一致性。

## 模組依賴誰?或被誰依賴?

Attribute 模組依賴 definition-config 模組的屬性模板和類型定義。
Attribute 模組被 character-sheet 模組依賴，用於計算角色屬性，以及 combat 模組依賴，用於戰鬥屬性應用。
