# Attribute 模組規格說明

## 簡介

Attribute 模組負責定義和管理遊戲中的角色屬性系統，包括屬性類型、預設值、限制範圍和基礎配置。模組提供統一的屬性詞彙和驗證機制，確保屬性值的合理性和一致性。最後更新時間：2025/12/09。

## 輸入與輸出

### 輸入

- 屬性覆蓋值（Partial<BaseAttributeValues>）：用於自訂角色的特定屬性值
- 屬性類型查詢（AttributeType）：指定要查詢或驗證的屬性類型

### 輸出

- 完整屬性配置（BaseAttributeValues）：包含所有屬性的完整數值集合
- 屬性限制資訊（AttributeLimits）：提供各屬性的最小值和最大值範圍
- 屬性預設值（AttributeDefaults）：系統預設的屬性數值

## 元件盤點

### 屬性定義元件

- AttributeType：定義系統中可用的屬性類型，包括血量、能量、攻擊、防禦、暴擊和復活相關屬性。
- BaseAttributeValues：基礎屬性數值配置介面，涵蓋所有屬性的數值定義。
- AttributeDefaults：屬性預設值常量，提供系統預設的屬性數值。
- AttributeLimits：屬性上下限定義，用於屬性值的驗證和範圍檢查。

### 工具元件

- createDefaultAttributes：建立預設屬性值的工廠函式，支持部分屬性覆蓋。
- AttributeLimitKey：屬性限制鍵的類型定義，便於類型安全的限制查詢。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- 無直接依賴：作為基礎定義模組，不依賴其他模組

### 被依賴的模組

- logic/attribute-system：屬性管理和計算系統，依賴屬性定義進行計算
- logic/combat：戰鬥系統，依賴屬性值進行傷害計算和角色管理
- domain/character：角色定義，依賴屬性配置建立角色實例
- UI 層：顯示屬性資訊，依賴屬性類型和限制進行介面渲染
