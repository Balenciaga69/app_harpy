## 道具（Item）

### Q: 什麼是道具？需要知道哪些重點？

#### 定義與類型

- 道具是遊戲中的核心元素，代表資源或裝備。
- 道具類型目前僅支援「RELIC」，可堆疊的特殊道具。
- 稀有度包含「COMMON」、「RARE」、「EPIC」、「LEGENDARY」，影響品質與掉落率。

#### 範本與屬性

- 道具範本（ItemTemplate）定義靜態屬性：id、名稱（I18nField）、描述、類型、稀有度、詞綴 id 列表、標籤（TagType）、負載成本（loadCost）。
- 遺物範本（RelicTemplate）繼承道具範本，額外加入最大堆疊數（maxStacks）。
- 道具紀錄（ItemRecord）包含建立資訊與詞綴紀錄（AffixRecord）。
- 道具聚合（ItemAggregate）結合紀錄、範本與詞綴聚合，提供單位屬性修正（UnitStatModifiers）。

#### 生成與服務

- 道具生成依據加權設定：來源類型（ItemRollSourceType，如「POST_COMBAT_REWARD」、「SHOP_REFRESH」）、類型權重、稀有度權重、修飾器策略（ItemRollModifierStrategy，如「MOST_FREQUENT_TAG」、「RARITY_PREFERENCE」）。
- 相關服務包含：道具聚合服務、道具約束服務、道具生成服務、道具滾動服務。
- item.data.ts 目前僅有空的遺物範本列表，需補充實際範本。

#### 遊戲中的角色

- 道具用於裝備或獎勵，透過詞綴修正影響單位屬性。
- 整合於模組：戰鬥結算、商店服務、關卡節點生成服務。

#### 建議提問

- 詞綴如何影響屬性？（參考 Affix.ts）
- 如何設定道具生成權重？（參考 item-roll-config.data.ts）
- 商店或戰鬥場景的使用方式？（參考 ShopService.ts、PostCombatProcessor.ts）

---

## 道具生成常見問答

### Q: 道具如何生成？舉例：商店與精英戰獎勵

#### 整體流程

- 道具生成服務根據設定（ItemRollConfig）生成道具：類型、稀有度、詞綴。
- 流程包含加權滾動、道具約束服務、修飾器。
- 來源類型（ItemRollSourceType）區分場景：「SHOP_REFRESH」、「POST_COMBAT_REWARD」。

#### 範例一：商店

- 商店服務透過道具生成服務觸發刷新（generateItemsForShopRefresh）。
- 使用「SHOP_REFRESH」設定，套用「MOST_FREQUENT_TAG」、「RARITY_PREFERENCE」等修飾器。
- 生成道具加入商店列表；若無有效道具則商店可能為空。

#### 範例二：精英戰獎勵

- 戰鬥結算處理器於精英戰後呼叫道具生成服務（generateItemsForPostCombatReward）。
- 使用「POST_COMBAT_REWARD」設定，考量敵人類型與難度，套用「ENEMY_TAG_PREFERENCE」。
- 獎勵加入玩家倉庫，數量與品質依戰鬥結果與設定權重決定。

#### 建議提問

- 如何設定道具生成權重？（參考 item-roll-config.data.ts）
- 詞綴如何附加到道具？（參考 AffixFactory.ts）
- 如何處理道具生成失敗？（參考 ItemConstraintService.ts）

---

### Q: 什麼是道具獎勵？

- 戰鬥獎勵類型包含：高稀有度遺物、高親和力、低親和力、金幣、首領獎勵、精英獎勵。
- 勝利後產生獎勵，依親和力（遺物標籤重複）調整。

### Q: 道具生成權重與方法在哪修改？設計師能否編輯？

- 主要設定在 item-roll-config.data.ts：類型權重、稀有度權重、修飾器策略。
- 設計師可編輯權重，但策略邏輯（如 MOST_FREQUENT_TAG）可能需開發協助，修改邏輯前請諮詢工程師。

### Q: 道具滾動很複雜，可以解釋嗎？什麼是修飾器？

- 道具滾動服務負責選擇類型、稀有度、範本，並套用修飾器調整權重。
- 修飾器是暫時性權重調整機制，定義於 ItemRollModifier.ts，類型包含稀有度、標籤、ID。
- 修飾器聚合服務依策略（如 MOST_FREQUENT_TAG）聚合修飾器。

### 結論：更多問題

- 親和力如何計算？影響哪些獎勵？
- 如何新增道具範本或修飾器策略？
- 道具生成失敗的邏輯是什麼？

---

### Q: 哲學：修飾器與滾動的本質是什麼？是鏈結還是網狀？

- 修飾器與滾動是動態權重調整系統，依情境驅動道具生成。
- 設定驅動：靜態權重來自 item-roll-config.data.ts，經修飾器聚合服務整合，套用於道具滾動服務。
- 結構非線性鏈結，更像網狀：道具滾動服務為核心，周圍有策略與聚合邏輯。
- 修飾器來源（如裝備屬性）互動，策略鬆耦合，透過修飾器策略工廠組合，方便擴充。

### 結論：更多問題

- 如何在此網狀系統中新增修飾器類型？
- 效能瓶頸在哪，如何優化？
