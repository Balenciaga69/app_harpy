# affix（詞綴）通用問答

## affix 是什麼

- affix（詞綴）是遊戲中最小的功能單元
- 出現在物品和敵人身上
- 可以是屬性加成、特殊效果等
- 沒有稀有度或等級，僅受難度係數影響
- 隨難度提升，affix 效果會增強

## affix 有哪些用途

- 增加角色或敵人的能力
- 提供特殊戰鬥效果

## affix 範例

- 抽到數字小於 7 的牌時恢復 5% 生命
- 戰鬥開始時獲得 10 點能量
- 閃避率 +1%

# affix 給設計師

## 如何設計 affix

- 設計 affix 的名稱、效果描述、實際效果
- 決定 affix 觸發時機、條件、行為（每個 affix 可有多個 effect 效果）
- affix 與物品、敵人、effect 分離，透過 id 關聯
- 效果可根據難度係數自動調整
- affixTemplate（詞綴模板）資料由表格維護

## 設計注意事項

- 設計時可考慮不同難度下的效果變化

# affix 給工程師

## 技術細節

- AffixTemplate 由 Store 載入，定義 affix 的靜態屬性、效果 ID、觸發規則
- AffixRecord 記錄已獲得 affix 的持久化資料，僅包含 templateId、堆疊數等
- AffixAggregate 由 Template + Record 組合而成，包含所有運行時行為
  - getUnitStatModifiers()：計算屬性修飾器
  - getEffectActions()：取得效果邏輯
  - 根據難度係數動態計算數值
- effect 結構定義在 AffixEffectTemplate 中，支援多樣化效果與觸發時機
- AffixAggregate 不被存入 DB，需要時由 Template + Record 動態組裝
- 計算時需根據難度係數調整 Affix 中所有涉及數值的 effect 倍率
