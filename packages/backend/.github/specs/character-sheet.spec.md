# Character-Sheet 模組

## 簡介

Character-Sheet 模組負責計算角色的完整屬性表，整合基礎屬性、裝備詞綴和遺物效果。支援動態修飾器應用和屬性聚合。最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- ICharacterSheetInput：包含基礎屬性、裝備實例和遺物實例。

### 主要輸出

- ICharacterSheet：包含計算後的屬性值、基礎屬性值和修飾器計數。

## 元件盤點

- CharacterSheetCalculator：屬性表計算器，整合所有處理器並計算最終屬性。
- EquipmentProcessor：裝備處理器，處理裝備詞綴並生成修飾器。
- RelicProcessor：遺物處理器，處理遺物效果並生成修飾器。
- AffixRegistry：詞綴註冊表，定義詞綴到屬性的映射。
- RelicRegistry：遺物註冊表，定義遺物效果計算邏輯。
- 介面層：定義ICharacterSheet、ICharacterSheetCalculator等契約，確保元件間一致性。

## 模組依賴誰?或被誰依賴?

Character-Sheet 模組依賴 attribute 模組的屬性管理器和計算器，item 模組的裝備和遺物實例，以及 definition-config 模組的詞綴和遺物定義。
Character-Sheet 模組被 combat 模組依賴，用於戰鬥屬性計算，以及 UI 模組依賴，用於角色屬性顯示。
