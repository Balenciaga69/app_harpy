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

---

## 模組的職責

- 動態生成遊戲中的裝備與遺物實例，讓每次掉落或產生的物品都能帶有隨機詞綴與屬性。
- 根據物品定義、難度、裝備槽位與隨機種子，決定生成物品的詞綴數量、內容與數值。
- 提供可重現的隨機生成流程，方便測試與遊戲平衡調整。

## 什麼時候會用到這個模組？

- 玩家打開寶箱、擊敗怪物、商店刷新時，需要即時產生隨機屬性的裝備或遺物。
- 測試或調整遊戲平衡時，想要重現某個特定隨機結果。
- 需要根據不同難度，產生更強或更稀有的裝備。
- 任何需要依據模板產生物品實例的場景。

## 系統怎麼運作的？

- 外部呼叫 ItemGenerator，傳入物品定義ID、難度、隨機種子。
- ItemGenerator 會根據物品類型，分派給 EquipmentGenerator 或 RelicGenerator。
- EquipmentGenerator 會：
  - 查詢物品定義與可用詞綴池。
  - 根據難度與稀有度決定詞綴數量。
  - 用 SlotBasedFilter 過濾不適合該裝備槽位的詞綴。
  - 用 AffixRoller 根據權重隨機選出詞綴，並決定每個詞綴的數值。
- RelicGenerator 會：
  - 查詢遺物定義，產生固定屬性的遺物實例。
- 最終產生 IEquipmentInstance 或 IRelicInstance，包含所有隨機詞綴與屬性。

## 他是由什麼組裝在一起？

- ItemGenerator：協調裝備與遺物生成，對外提供統一入口。
- EquipmentGenerator：處理裝備詞綴的隨機生成與槽位過濾。
- RelicGenerator：產生遺物實例，通常不帶隨機詞綴。
- AffixRoller：根據權重與範圍，隨機選出詞綴並決定其數值。
- SlotBasedFilter：根據裝備槽位過濾可用詞綴，確保合理性。
- IAffixFilter：定義詞綴過濾策略的介面，方便擴充不同過濾邏輯。

這些元件協同合作，讓物品生成流程既靈活又可控，能滿足各種遊戲場景下的隨機物品需求。
