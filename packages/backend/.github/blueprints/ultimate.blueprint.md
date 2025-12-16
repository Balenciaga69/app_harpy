## Ultimate

### 來源與觸發

- Ultimate 來源
  - 來自物品欄位中的 Skill Gem
- 觸發時機
  - 戰鬥中玩家滿能量後會釋放大絕招
  - 釋放後能量會被清空

---

### Pool 設計

- 大絕招來源
  - 來自固定的 ultimate pool
- Pool 分類
  - 根據職業分為不同 pool
  - 也有通用 pool 可供所有職業使用
- Pool 限制
  - 每個 pool 有對應的需求門檻

---

### 生成與組合

#### Ultimate Skill Generator

- Ultimate 技能會由 Ultimate Skill Generator 生成

#### Ultimate Gem 本質

- Ultimate Gem 的本質
  - 由 Affixes 組合而成
  - 綁定特定技能

#### Affix 組合範例

- 例如：同樣是斬殺波
  - 有的角色放完可以補血
  - 有的角色下次攻擊有機率再滿能量條

---

### 互動與實例化

#### 複雜互動

- 大絕招設計較為複雜
  - 常與異常狀態系統互動

#### 戰鬥前實例化

- 戰鬥開始前
  - 從 Skill Gem 將技能轉成 Instance
  - 將 Affix 轉成監聽戰鬥事件的各種 Affix Instance
  - 這些 Affix Instance 會參與戰鬥

---

### 數據角色

- 戰鬥外
  - Ultimate 只是個數據容器
  - 與其他裝備無異
