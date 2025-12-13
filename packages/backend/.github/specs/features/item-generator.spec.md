# Item-Generator 模組

## 簡介

- 功能: 負責動態生成物品實例，包括裝備和遺物。
- 特性: 支援詞綴的隨機滾動、槽位過濾和難度調整。
- 機制: 提供可重現的隨機生成機制。
- 最後更新時間: 2025-12-13。

## 輸入與輸出

### 主要輸入

- 物品定義ID：指定要生成的物品類型。
- 難度係數：影響詞綴數量和品質。
- 隨機種子：確保生成的可重現性。

### 主要輸出

- IEquipmentInstance/IRelicInstance：生成的物品實例，包含詞綴和屬性。

## 元件盤點

- ItemGenerator：物品生成協調器，整合裝備和遺物生成器。
- EquipmentGenerator：裝備生成器，處理裝備詞綴的隨機生成和槽位過濾。
- RelicGenerator：遺物生成器，生成遺物實例。
- AffixRoller：詞綴滾動器，根據權重和範圍生成詞綴實例。
- SlotBasedFilter：槽位過濾器，根據裝備槽位過濾可用詞綴。
- 介面層：IAffixFilter等，定義過濾策略契約。

## 模組依賴誰?或被誰依賴?

Item-Generator 模組依賴 item 模組的定義和註冊表，以及 definition-config 模組的模板。
Item-Generator 模組被 shop 模組依賴，用於生成商店物品，以及其他需要動態物品生成的模組。
