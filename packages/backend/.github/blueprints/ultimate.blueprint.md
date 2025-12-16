## 終極技能

### 來源與觸發

- 來源：物品欄位中的 Skill Gem
- 觸發時機：
  - 戰鬥中玩家能量充滿自動釋放終極技能
  - 釋放後能量重置為零

### Pool 設計

- 來源：固定 ultimate pool
- 分類：
  - 按職業分類的池
  - 也有通用 pool
- 限制：每 pool 有需求閾值

### 生成與組合

- Ultimate 技能由終極技能生成器生成
- Ultimate Gem：
  - 由 Affixes 組合
  - 綁定至特定技能
- Affix 組合範例：
  - 斬殺波可有不同附加效果（如生命值恢復、下次攻擊能量充滿）

### 互動與實例化

- 複雜互動：終極技能常與異常狀態系統互動
- 戰鬥前實例化：
  - Skill Gem 轉換為技能 Instance
  - Affix 轉換為監聽戰鬥事件的 Affix Instance
  - 這些 Affix Instance 參與戰鬥

### 數據角色

- 戰鬥外：Ultimate 僅為資料容器，與其他裝備無異
