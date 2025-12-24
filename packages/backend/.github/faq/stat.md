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

- 所有屬性來源需先轉換成 Stat Modifier（屬性修飾器）
- Stat Modifier 分為 Add（加法）與 Multiply（乘法）
- Stat Calculator 負責將所有 Stat Modifier 計算成最終屬性值
- 主要流程：
  - 收集所有來源（裝備、詞綴、難度等）
  - 轉換成 Stat Modifier
  - Stat Calculator 計算最終值
- Affix（詞綴）上的 AffectEffect 需轉換為 Stat Modifier
- Stat Modifier 計算順序與合併規則需明確
- TODO：AffectEffect 轉 Stat Modifier 的詳細轉換過程
