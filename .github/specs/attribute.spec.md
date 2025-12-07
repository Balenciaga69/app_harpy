# Attribute 模組規格書

## 目標功能與範圍

### 會實現的功能

- 定義所有屬性類型（生命、能量、攻擊、防禦、暴擊、復活）
- 提供基礎屬性數值介面
- 提供屬性預設值與上下限常數
- 提供建立預設屬性的工具函數
- 作為所有模組的共享詞彙基礎

### 不會實現的功能

- 屬性計算邏輯（由 Combat Engine 負責）
- 屬性修正器管理（由 Combat Engine 負責）
- 屬性 UI 顯示（由 UI 模組負責）
- 屬性變更追蹤（由 Combat Engine 負責）

---

## 架構與元件關係

### 模組定位

最底層的共享定義模組，所有模組都依賴它。

### 依賴方向

- Combat Engine 使用此模組定義屬性計算邏輯
- Character 模組使用此模組定義角色基礎屬性
- Item 模組使用此模組定義裝備詞綴數值
- UI 模組使用此模組顯示屬性資訊

### 檔案結構

- attribute-type.ts 定義所有屬性類型
- attribute-values.ts 定義基礎屬性介面與工具函數
- attribute-constants.ts 定義預設值與上下限
- index.ts 統一導出

---

## 對外暴露的主要功能

### 類型定義

- AttributeType 包含 15 種屬性類型
- BaseAttributeValues 包含所有屬性的完整配置

### 常數定義

- AttributeDefaults 提供所有屬性的預設值
- AttributeLimits 提供所有屬性的合法範圍

### 工具函數

- createDefaultAttributes 建立預設屬性配置，支援部分覆蓋
