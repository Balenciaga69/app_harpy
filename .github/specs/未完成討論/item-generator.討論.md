# ItemGenerator 模組討論稿(v1)

## 目標功能與範圍

### 會實現的功能

- 根據難度係數與職業，獨立生成裝備和遺物實例（帶有隨機屬性）
- 支援職業專屬裝備池篩選（哪些裝備適合哪些職業）
- 支援稀有度權重計算（基於難度係數調整生成概率）
- 支援 Affix 模板庫（定義詞綴範圍與權重）
- 確保生成結果可重現（使用 seedrandom）
- 提供生成 API 供其他模組調用

### 不會實現的功能

- 物品定義管理（由 domain/item 負責）
- 庫存管理（由 Inventory 模組負責）
- 戰鬥效果實作（由 Combat 模組負責）
- UI 渲染（由 UI 模組負責）
- 物品掉落計算（由 Loot 模組負責）
- 存讀檔（由 PersistentStorage 模組負責）

### 補充資料需求

- 職業裝備池：定義各職業允許的裝備 ID 列表（e.g., 戰士: ['sword', 'shield']）
- 稀有度權重公式：簡單計算，如普通: 50% + 難度*0.1，稀有: 30% - 難度*0.05
- Affix 模板庫：擴充 domain/item/affixes/，定義 10-20 個範例模板（攻擊、防禦、機制屬性）

## 架構與元件關係

### 模組定位

位於後端純運算模組層（logic/item-generator），提供獨立的物品生成邏輯，無外部依賴，可被多個模組重用。

### 依賴方向

- 僅依賴 DifficultyScaler（獲取難度係數）、domain/item（物品與詞綴定義）、domain/character（職業定義）
- 被 Inventory 使用（生成新物品）
- 被 CombatEngine 使用（敵人裝備生成）
- 被 Run 模組使用（掉落生成）

### 檔案結構建議

- ItemGenerator.ts：核心生成類別
- models/：生成相關介面與常數
- index.ts：統一導出

## 核心元件

### ItemGenerator

負責物品生成的 Facade 類別。接受難度係數、職業 ID、隨機種子作為輸入，輸出生成的裝備或遺物實例。

- 方法：generateEquipment、generateRelic
- 內部邏輯：篩選池子 → 計算權重 → 隨機選取 → 擲骰 affixes

### 職業裝備池映射

靜態資料結構，將職業 ID 映射到允許裝備 ID 列表。支援擴充新職業。

### 稀有度權重計算器

純函數，根據難度係數計算各稀有度的生成權重。確保高難度下稀有物品更常出現。

### Affix 生成器

整合 domain/item 的 AffixRoller，根據模板擲骰詞綴數值。

## 對外暴露的主要功能

### 類別導出

- ItemGenerator：物品生成器

### 方法導出

- generateEquipment(difficulty: number, classId: string, seed: string): IEquipmentInstance
- generateRelic(difficulty: number, classId: string, seed: string): IRelicInstance

### 類型重新導出

- 從 domain/item 重新導出 IEquipmentInstance、IRelicInstance 等

## 設計原則

- 單一職責：僅負責生成邏輯
- 無副作用：相同輸入永遠相同輸出
- 跨語言可移植：純 TypeScript 邏輯
- 易於測試：支援單元測試驗證生成結果

## 開發複雜度評估

- 整體複雜度：中等偏低（類似 DifficultyScaler）
- 潛在挑戰：遊戲平衡設計（裝備池與權重需測試）
- 建議步驟：先定義補充資料 → 實作核心邏輯 → 寫測試 → 整合

## 待討論點

- 職業裝備池的定義方式：硬編碼映射 vs. 從職業定義讀取？
- 稀有度權重公式細節：如何平衡難度與概率？
- Affix 模板數量與範圍：從哪些屬性開始？
- 錯誤處理：無效職業或難度時的行為？

---

討論 更新至 V2

- 整合 domain/item 的 AffixRoller，是否該搬到 item-generator？
- 重新盤點 一個裝備生成需要哪些東西?
- 我們可以參考一些大公司她們遊戲的作法嗎?
- [可能與該模組無關的問題] 職業、裝備、稀有度、詞綴 這些東西的定義與管理，應該放在哪個模組?
- 我連該有哪些屬性都沒構思 要怎麼先想要生成?
- 還是我們要先來設計遊戲該有哪些 詞綴、裝備、職業? 至少一個職業來構思?

---

討論 更新至 V3（回應 V2 問題）

### 1. 整合 domain/item 的 AffixRoller，是否該搬到 item-generator？

- **建議**：不搬。AffixRoller 是 domain/item 的核心工具，負責詞綴擲骰邏輯（權重選取 + 數值範圍）。ItemGenerator 應依賴它，而不是複製邏輯。這符合單一職責：domain 負責定義與工具，logic 負責運算。搬過去會增加耦合，且違反 DRY（如果其他模組也需擲骰）。

### 2. 重新盤點 一個裝備生成需要哪些東西?

- **核心輸入**：難度係數（DifficultyScaler）、職業 ID（篩選池子）、隨機種子（seedrandom）。
- **資料來源**：職業裝備池映射（職業 → 允許裝備 ID）、物品定義註冊表（domain/item）、詞綴定義註冊表（domain/item）。
- **生成步驟**：
  1. 根據職業篩選裝備池。
  2. 計算稀有度權重（基於難度）。
  3. 隨機選取裝備定義 + 稀有度。
  4. 擲骰詞綴（數量、類型、數值）。
  5. 組裝實例（ID、定義、詞綴、槽位等）。
- **輸出**：IEquipmentInstance 或 IRelicInstance（含詞綴實例）。

### 3. 我們可以參考一些大公司她們遊戲的作法嗎?

- **可以，但適度**：參考 Diablo-like 或 Slay the Spire 的生成邏輯（e.g., 詞綴權重隨難度調整，職業專屬池）。但專案強調 RogueLite + 賭博（game.instructions.md），所以重點在「刺激與隨機性」（e.g., 高風險高回報詞綴）。避免複雜公式，保持簡單可移植。

### 4. [可能與該模組無關的問題] 職業、裝備、稀有度、詞綴 這些東西的定義與管理，應該放在哪個模組?

- **domain 層**：職業（domain/character）、裝備/詞綴（domain/item）。這是共享詞彙，無邏輯。ItemGenerator 只負責生成，不管理定義。符合專案模組分割（domain 為共享定義）。

### 5. 我連該有哪些屬性都沒構思 要怎麼先想要生成?

- **先設計屬性**：參考 game.instructions.md 的屬性分層（攻擊、防禦、機制）。從基礎開始：HP、攻擊力、暴擊、復活率等。生成前需有屬性清單，才能設計詞綴。

### 6. 還是我們要先來設計遊戲該有哪些 詞綴、裝備、職業? 至少一個職業來構思?

- **建議先設計**：是的。從一個職業（e.g., 戰士）開始：定義其屬性修正、裝備池（武器、護甲）、詞綴範例（攻擊力 +10-50）。這有助於原型測試生成邏輯。設計後，再回頭完善 ItemGenerator。

### 下一步建議

- 先補充 domain 層：設計 1-2 個職業、5-10 個裝備定義、10 個詞綴模板。
- 然後實作 ItemGenerator 的 MVP（固定池子測試）。
- 如果同意，更新討論稿或開始設計資料。

---

討論 更新至 V4（回應 V3 建議）

- 我們開一個新的 畫板.md 來討論設計相關的內容(這邊與 item-generator 不是直接綁定)
- affix 標準的基本上就上來自 AttributeType 然後將 affix 的類型分成三大類: 攻擊(攻擊、暴擊、命中)、防禦(護甲閃避生命)、機制(能量獲取、復活)
- 職業就先來個最爛大街的，戰士吧
- equipment-definition,item definition 很好的展示了裝備會有的東西
- 我的構想是 1-10層會有很多 common/magic 的裝備，但之後玩家只會拿到 rare/legendary 為主的裝備
- relic 我希望是自己量身打造的，而非隨機生成的東西，所以 relic。
- legendary equipment 是固定的，而 rare equipment 才是隨機生成的
- 武器 100% 不會Roll出現防禦屬性、EquipmentSlot 會影響到職業裝備池的篩選
- 頭盔與盔甲不會Roll出攻擊屬性
- 其餘則都可以Roll
- 戰士新增一個傳說頭盔: 宙斯頭, Charge異常Buff狀態再額外 +4% 攻擊速度與 +20 armor/charge
- 戰士 relic 新增 泰坦之心: 每 10HP + 2 護甲 (可疊加)
- 你以遊戲設計師與軟體架構師的眼光開一個新頁面跟我討論如何滿足這些業務需求的開發(無代碼、純口頭討論與規劃)
