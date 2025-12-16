## 終極技能

### 來源與觸發

- 來源：物品欄位中的 Ultimate Gem（參考 Path of Exile 的 Grafts 系統）
- Ultimate Gem 本身是一個物品，附帶提供一個技能
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

- Ultimate Gem 由終極技能生成器生成
- Ultimate Gem：
  - 附帶提供一個技能
  - 本身有自己的 Affix 系統，這些 Affix 會影響提供的技能
- Affix 組合範例：
  - 技能 破甲劍（無視防禦運算）
  - Affix1：增加該大招吸血效果
  - Affix2：減少該大招所需的能量

### 互動與實例化

- 複雜互動：終極技能常與異常狀態系統互動
- 戰鬥前實例化：
  - Skill Gem 轉換為技能 Instance
  - AffixTemplate 實例化為 AffixInstance，監聽戰鬥事件
  - 這些 AffixInstance 參與戰鬥

### 數據角色

- 戰鬥外：Ultimate 僅為資料容器，與其他裝備無異
