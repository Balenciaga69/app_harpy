# Character-Sheet 模組規格說明

## 簡介

Character-Sheet 模組負責計算角色的最終屬性面板（靜態數據），用於戰鬥外的 UI 展示。模組整合角色基礎屬性、裝備詞綴和遺物效果，使用與戰鬥系統相同的屬性計算邏輯，確保數據一致性。最後更新時間：2025/12/10。

## 輸入與輸出

### 輸入

- 角色基礎屬性（BaseAttributeValues）：角色的初始屬性值
- 裝備實例列表（IEquipmentInstance[]）：已裝備的裝備及其詞綴
- 遺物實例列表（IRelicInstance[]）：已擁有的遺物及其堆疊數量

### 輸出

- 角色屬性面板（ICharacterSheet）：包含所有屬性的最終值、基礎值和修飾器統計

## 元件盤點

### 核心元件

- CharacterSheetCalculator：主計算器，整合所有處理器並使用 AttributeManager 計算最終屬性。純函數設計，無副作用。

### 處理器元件

- EquipmentProcessor：將裝備實例的詞綴轉換為 AttributeModifier 列表。查詢詞綴映射註冊表，跳過未註冊的純效果型詞綴。
- RelicProcessor：將遺物實例轉換為 AttributeModifier 列表。支援基於基礎屬性的動態計算（如 HP 轉護甲）。

### 配置元件

- AFFIX_ATTRIBUTE_MAPPINGS：詞綴屬性映射註冊表，定義每個詞綴如何影響角色屬性。
- RELIC_ATTRIBUTE_MAPPINGS：遺物屬性映射註冊表，定義每個遺物的屬性計算邏輯。
- AFFIX_MAPPING_LOOKUP：詞綴映射快速查找表（Map 結構）。
- RELIC_MAPPING_LOOKUP：遺物映射快速查找表（Map 結構）。

### 模型元件

- ICharacterSheet：角色屬性面板輸出模型，包含最終屬性、基礎屬性和修飾器統計。
- ICharacterSheetInput：計算器輸入模型，包含基礎屬性、裝備和遺物。
- IAffixAttributeMapping：詞綴屬性映射配置介面，定義詞綴到屬性修飾器的轉換規則。
- IRelicAttributeMapping：遺物屬性映射配置介面，定義遺物的屬性計算函數。

## 模組依賴誰?或被誰依賴?

### 依賴的模組

- domain/attribute：屬性定義，依賴 AttributeType 和 BaseAttributeValues
- domain/item：物品定義，依賴裝備和遺物的實例介面
- logic/attribute-system：屬性計算，複用 AttributeManager 和 AttributeCalculator

### 被依賴的模組

- UI 層：角色面板顯示，依賴 ICharacterSheet 進行介面渲染
- 未來的背包系統：裝備預覽，依賴計算器預覽裝備效果
- 未來的角色管理系統：角色數據管理，依賴屬性面板快照

## 設計特點

### 靜態 vs 動態

- 本模組專注於靜態計算，不涉及戰鬥內的動態效果（Buff、異常狀態等）
- 僅處理裝備與遺物的固定屬性增益，忽略戰鬥內觸發的特殊效果

### 映射表機制

- 使用獨立的映射表將詞綴和遺物轉換為屬性修飾器
- 與戰鬥系統的 Effect 系統解耦，避免靜態計算依賴戰鬥上下文
- 支援複雜的計算邏輯（如遺物的 HP 轉護甲公式）

### 可擴展性

- 新增詞綴或遺物時，只需在對應的映射表中添加配置
- 映射表與業務邏輯分離，便於維護和測試
