## Ultimate

### 來源與觸發

- 來源：物品欄位中的 Skill Gem
- 觸發時機：
  - 戰鬥中玩家滿能量自動釋放大絕招
  - 釋放後能量歸零

### Pool 設計

- 來源：固定 ultimate pool
- 分類：
  - 依職業分 pool
  - 也有通用 pool
- 限制：每 pool 有需求門檻

### 生成與組合

- Ultimate 技能由 Ultimate Skill Generator 生成
- Ultimate Gem：
  - 由 Affixes 組合
  - 綁定特定技能
- Affix 組合範例：
  - 斬殺波可有不同附加效果（如補血、下次攻擊再滿能量）

### 互動與實例化

- 複雜互動：大絕招常與異常狀態系統互動
- 戰鬥前實例化：
  - Skill Gem 轉成技能 Instance
  - Affix 轉成監聽戰鬥事件的 Affix Instance
  - 這些 Affix Instance 參與戰鬥

### 數據角色

- 戰鬥外：Ultimate 僅為數據容器，與其他裝備無異
