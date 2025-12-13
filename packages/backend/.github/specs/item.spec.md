# Item 模組

## 簡介

Item 模組負責管理物品系統，包括裝備、遺物和詞綴的定義、註冊和實例化。支援物品的動態生成和效果轉換，提供完整的物品管理架構。最後更新時間：2025-12-13。

## 輸入與輸出

### 主要輸入

- IItemDefinition：物品定義，包含基本屬性和配置。
- IAffixInstance：詞綴實例，包含定義ID和滾動值。

### 主要輸出

- IEquipmentInstance/IRelicInstance：物品實例，包含詞綴和屬性。
- IEffectTemplateInfo[]：效果模板資訊，用於效果生成。

## 元件盤點

- AffixDefinitionRegistry：詞綴定義註冊表，管理詞綴的註冊和查詢。
- ItemDefinitionRegistry：物品定義註冊表，管理物品的註冊和查詢。
- CombatItemFactory：戰鬥物品工廠，生成戰鬥用的物品視圖。
- EffectFactory：效果工廠，從詞綴生成效果模板資訊。
- 定義介面：IEquipmentDefinition、IRelicDefinition等，定義物品結構。
- 投影介面：ICombatItemView、IInventoryItemView等，提供不同場景的視圖。
- 錯誤處理：ItemError，自訂錯誤類別。

## 模組依賴誰?或被誰依賴?

Item 模組依賴 definition-config 模組的物品和詞綴模板。
Item 模組被 character-sheet 模組依賴，用於裝備和遺物處理，以及 effect 模組依賴，用於效果生成。
