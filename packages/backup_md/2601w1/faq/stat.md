# stat（屬性）通用問答

## stat 是什麼

- stat（屬性）是角色或敵人身上的各種能力數值總稱
- 常見屬性有生命、閃避、攻擊力、最大能量、復活機率、復活後生命百分比

## stat 有哪些用途

- 決定角色與敵人在戰鬥中的表現
- 顯示在角色或敵人資訊面板

## stat 來源有哪些

- 玩家 stat 來自裝備、遺物等物品
- 敵人 stat 來自模板設定與難度加成

# stat 給設計師

## 如何設計 stat

- 每個角色或敵人都可以有多種屬性
- 可設計不同的屬性類型與數值範圍
- 屬性可以被物品、詞綴（affix）、難度等多種來源影響
- 設計時可考慮哪些屬性會影響戰鬥、哪些只做顯示

## stat 設計注意事項

- 屬性來源需明確，方便玩家理解
- 可設計加法與乘法兩種影響方式
- 屬性計算時機需明確，例如進入戰鬥或打開面板時

# stat 給工程師

## 技術細節

- 所有屬性來源需先轉換成 StatModifier（屬性修飾器）
- StatModifier 分為 Add（加法）與 Multiply（乘法）
- UnitStatsBuilder 負責收集所有來源與轉換
- UnitStatAggregate 負責將所有 StatModifier 計算成最終屬性值
- 主要流程：
  - 收集所有來源（基礎屬性、裝備詞綴、難度加成等）
  - 轉換成 StatModifier
  - UnitStatAggregate 計算最終值
- AffixEffectAction 中的倍率需根據難度係數與 StatModifier 進行轉換
- StatModifier 計算順序：先所有 Add 相加，再套用 Multiply
