# Ultimate（終極技能）

## 語意級（設計師閱讀）

### 數值調整與難度係數

- Ultimate Effect 數值會根據「難度係數倍率」進行調整。
- 生成 Ultimate 時，會帶入當前關卡或遊戲進度的難度係數。
- 計算公式與 affix 相同，確保技能強度隨進度動態調整。

### 來源與觸發

- Ultimate Gem 源自物品欄位，本身是物品，附帶提供一個技能。
- 戰鬥中玩家能量充滿自動釋放終極技能。
- 釋放後能量重置為零。

### Plugin Affix（技能外掛詞綴）

- Plugin Affix 是直接注入至 Ultimate 的動態增強機制，無需額外 UI 交互。
- 注入來源：
  - 獎勵系統（Post-Combat Reward）
  - 事件系統（Level Event）
  - 商店系統（Shop）
- 注入方式：直接將 Plugin Affix 附加至 UltimateInstance 的詞綴陣列。
- 多層支持：一個技能可累積多個 Plugin Affix，效果自動疊加。

### 池設計

- 來源：固定 ultimate pool（按職業分類與通用 pool）。
- 需求：每 pool 有需求閾值。
- Plugin Affix 池：每個技能有對應的可用詞綴列表。

---

## 架構級（架構師閱讀）

### 技能定義

- Ultimate Gem Template 包含：
  - 技能 ID（如破甲劍、冰刃等）。
  - 基礎效能（傷害、命中率、冷卻等）。
  - 可用 Plugin Affix 池（該技能能附加的詞綴清單）。

### Plugin Affix 應用流程

- 獎勵系統、事件系統或商店系統決定注入的 Plugin Affix。
- 驗證該詞綴未被附加過（可選，取決於設計）。
- 創建 AffixInstance 並加入 ultimateInstance.attachedAffixes。
- 詞綴在戰鬥中自動生效，無需額外管理。

---

## 代碼級（工程師閱讀）

### 數據結構（暫定）

- 技能實例 UltimateInstance（SkillInstance）：
  - ultimateTemplateId: string
  - attachedAffixes: AffixInstance[] // 已附加的 Plugin Affix

### Plugin Affix 應用流程（代碼級）

- 獎勵系統、事件系統或商店系統決定注入的 Plugin Affix。
- 驗證該詞綴未被附加過（可選，取決於設計）。
- 創建 AffixInstance 並加入 ultimateInstance.attachedAffixes。
- 持久化到存檔。

### 戰鬥前準備

- 載入已裝備技能的所有 AffixInstance。
- 註冊為事件監聽器與修飾符來源。
- 技能根據 Plugin Affix 改變行為。

---

## 技能設計範例

1. 破甲劍：消耗能量 100，對血量最低的敵人造成攻擊 240% 傷害，接下來三次命中的攻擊 +5 能量。
   - 月光再生 Plugin Affix 示例：原本生命回復 33%，透過 Plugin Affix 提高至 66%（即 +33%）。

2. 冰刃：消耗能量 100，對敵人施加 150 層冰緩，並附加等值的其他異常（流血、感電）層數。

3. 護盾術：消耗能量 100，增加 3000 Armor、3000 Evasion，持續 3000 Ticks。
