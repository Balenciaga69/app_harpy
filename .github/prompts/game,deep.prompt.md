# 遊戲機制與架構設計指南 (2025/12/05)# 遊戲機制與設計大綱（2025/12/01）

## 1. 專案願景與核心概念## 遊戲核心概念

本專案旨在打造一款高可維護性、架構嚴謹的單機即時制戰鬥 RogueLite 遊戲。- 單機即時制戰鬥 RogueLite，玩家配置角色、裝備、技能，挑戰層層關卡。

核心體驗類似《Slay the Spire》的結構（爬塔、遺物、隨機性）結合《Darkest Dungeon》或自動戰鬥遊戲的戰鬥節奏。- 戰鬥以 tick 為單位，自動進行，玩家僅於戰前配置與選擇技能。Replay 的時候是以 1x速度播放，同時10ms = 1tick。

- 具備裝備、大絕招、遺物等多元養成與策略選擇。

### 關鍵技術目標

- 邏輯與表現分離：核心邏輯（Combat/Run）必須能獨立於 UI 運行，甚至可移植至後端或其他語言。## 戰鬥系統

- 決定性運算：戰鬥過程由種子（Seed）決定，必須保證在任何時間、任何機器上重播結果一致。

- 解決「遺物邏輯耦合」難題：記取《Slay the Spire》等前輩的教訓，避免將「物品效果邏輯」寫死在「物品管理系統」中，導致後期維護困難。### 1. 攻擊邏輯

---- 僅分「普通攻擊」與「大招」兩種，無元素傷害規則。

- 普通攻擊有 cooldown（等待時間，單位 tick），大招需能量條充滿後釋放，無 cooldown。

## 2. 系統架構總覽- 能量條由角色屬性決定獲取速度，並有自然回復。

- 傷害分為「一般傷害」與「真實傷害 True Damage」（無視任何減免）。

系統採用模組化設計，模組間遵循單向依賴與依賴注入（DI）原則。- 異常狀態（聖火、燃燒、中毒、充能等）獨立於元素屬性，並可被裝備、角色、聖物等影響。

- 閃避與減免機制自訂，簡化公式，避免複雜計算。

### 依賴關係層級

1. UI 層 (Presentation)：React/HeroUI，負責顯示與接收輸入，不含核心遊戲邏輯。### 2. 戰鬥流程

2. 協調層 (Orchestration)：Run Engine，負責串聯各個子系統，管理遊戲生命週期。

3. 業務邏輯層 (Domain Logic)：Combat, Encounter, Shop, Reward 等具體業務模組。- 玩家與敵人依據冷卻時間自動執行行動。

4. 數據層 (Data/State)：Inventory, Persistence，負責資料的 CRUD 與持久化。- 主攻擊僅能有一種（武器或法術），法術必中、無暴擊，武器有命中與暴擊判定。

- 戰鬥結果於載入時即決定，過程不可干預。

---

### 3. 異常狀態與效果

## 3. 模組詳細規格說明

- 異常狀態機制目前還在構思，可能會大改動

### 3.1 Combat 模組（戰鬥引擎）✅ [已完成]- 聖火、充能、冰緩、毒等異常狀態有各自疊加、減少、觸發規則。

- 無屬性異常如致盲、破甲、出血、褻瀆等，影響命中、護甲、生命等。

* 用途：輸入雙方數據與種子，輸出完整的戰鬥過程與結果。這是一個「黑盒」引擎。- 部分裝備、聖物可改變異常狀態的計算方式或效果。

* 設計模式：
  - Onion Architecture (洋蔥架構)：核心 Domain (Character/Effect) 不依賴外部，外層 Infra 依賴內層。## 角色與裝備系統

  - Command Pattern (命令模式)：所有戰鬥行動（攻擊、施法）封裝為 Command，便於快照與日誌記錄。

  - Snapshot (快照模式)：每一 Tick 的狀態都可被記錄，用於回放與驗證。### 1. 屬性分層

* 依賴關係：不依賴任何上層模組。被 Run Engine 與 Replay System 依賴。

* 技術難點：- 防禦：HP、護甲（%減傷）、閃避（與命中值運算）。
  - 浮點數決定性：需確保所有運算在不同環境下結果一致（目前使用整數運算或固定小數位）。- 攻擊：攻擊力、冷卻、暴擊率、命中值、攻擊標籤。

  - 效果系統 (Effect System)：這是最複雜的部分，需處理 Buff/Debuff 的堆疊、互斥、觸發時機（OnHit, OnDamageTaken 等）。

### 2. 裝備分類與機制

### 3.2 Replay 模組（回放系統）✅ [已完成]

- 武器（或魔法書）、頭盔、裝甲、項鍊。

* 用途：將 Combat 模組產生的靜態數據（CombatResult）轉化為使用者可觀看的動態視覺流程。- 其實本質上都是遺物(Items)，只不過遺物可以無限堆疊，但裝備武器只能裝備一個。

* 設計模式：- 遺物物品可能改變遊戲玩法，所以需要複雜運算鍊。
  - Event-Driven Architecture (事件驅動)：透過 EventBus (mitt) 發送 `Tick`, `Damage`, `Effect` 事件，UI 訂閱這些事件來更新畫面。- 裝備有升級系統

  - State Machine (狀態機)：管理播放狀態（Playing, Paused, Completed）。

  - Adapter Pattern (轉接器模式)：將戰鬥數據轉換為播放器可理解的時間軸格式。## 關卡與進程

* 依賴關係：依賴 Combat 模組（的型別與結果）。被 UI 層依賴。

* 技術難點：- 關卡分一般、小型 Boss、大型 Boss、正面事件。
  - 時間軸控制：需支援暫停、倍速、拖拉進度條（Seek），且畫面狀態必須與邏輯狀態精確同步。- 層數遞增，怪物屬性依難度係數調整。

- 最高 30 關，每 5 關有中型 Boss，每 10 關有大型 Boss。

### 3.3 Inventory 模組（庫存管理）🔨 [待實作]- 超過 30 關，則進入無盡模式，難度持續提升。

- 用途：純粹的資料管理容器。管理玩家擁有的裝備（Equipment）與遺物（Relics）。## 掉落與商店

- 關鍵架構決策（解決兩年維護難題）：
  - 職責分離：Inventory 只負責 CRUD（新增、刪除、查詢、序列化）。它不知道「火焰劍」會造成燃燒，也不知道「吸血戒指」會回血。- 每關結束可三選一獎勵（裝備、遺物）。

  - 邏輯歸屬：物品的具體「效果邏輯」完全由 Combat 模組 的 `ResourceRegistry` 和 `EffectSystem` 負責。Inventory 只提供 ItemID。- 商店可隨時進入，購買物品。

  - 這避免了 Inventory 變成一個包含所有遊戲邏輯的 God Class。- 物品價格被係數控制，隨關卡提升而通膨。

- 設計模式：
  - Repository Pattern：提供類似資料庫的存取介面。## 死亡與重試

- 依賴關係：被 Run Engine, Shop, Reward 依賴。不依賴 Combat。

- 參考對象：類似傳統 RPG 的背包系統，但更輕量化。- 玩家有 n 次死亡機會，失敗將回到戰鬥前，並且商店老闆會給你一個抽獎盲盒作為補償並刷新商店內容。

### 3.4 Run Engine（遊戲進程管理）🔨 [待實作]## 模組架構設計原則

- 用途：遊戲的「大腦」。管理從第 1 層到第 30 層的完整流程，處理死亡、存檔、場景切換。### 核心原則

- 設計模式：
  - Finite State Machine (有限狀態機)：管理 `MapState` -> `CombatState` -> `RewardState` -> `ShopState` 的流轉。- 遊戲邏輯完全獨立於 UI 與框架（可移植到 C#、Python、Go 等語言）

  - Mediator Pattern (中介者模式)：協調 Inventory, Combat, Encounter 等模組，避免它們互相依賴。- 模組間依賴方向：下層不依賴上層，保持低耦合、高內聚

- 依賴關係：依賴所有其他業務模組。被 UI 層依賴。- 所有狀態可序列化，支援存檔/讀檔

- 技術難點：- 使用依賴注入（DI）確保可測試性
  - 狀態回滾 (Rollback)：RogueLite 的核心機制。當玩家死亡或重試時，需精確將所有模組狀態（血量、背包、亂數種子）還原到戰鬥前。

  - 異步流程控制：需等待 UI 動畫或玩家操作（如選獎勵）完成後才能推進狀態。---

### 3.5 Encounter 模組（遭遇生成）🔨 [待實作]## 已完成模組

- 用途：根據當前樓層與難度係數，生成敵人隊伍配置。### Combat 模組（戰鬥引擎）✅

- 設計模式：
  - Factory Method (工廠模式)：根據參數動態產出 Enemy 實例。定位: 黑盒計算引擎

  - Strategy Pattern (策略模式)：不同類型的關卡（精英、Boss、普通）使用不同的生成演算法。

- 依賴關係：被 Run Engine 依賴。架構:

### 3.6 Persistence 模組（持久化）🔨 [待實作]- 分層依賴：infra → context → domain → logic → coordination → combat-engine

- Onion 架構，嚴格的依賴方向控制

* 用途：負責將 Run, Inventory 等模組的狀態序列化為 JSON 並存入 LocalStorage 或 IndexedDB。

* 技術難點：職責:
  - 版本遷移 (Migration)：當遊戲更新（如新增欄位）時，舊存檔必須能透過遷移腳本讀取，不能壞檔。

  - 循環引用處理：確保序列化時不會因為物件互相引用而崩潰。- 輸入：角色配置、裝備、技能、隨機種子

- 輸出：`CombatResult`（快照 snapshots + 日誌 logs + 勝者 winner）

---- 特性：純函數式戰鬥計算，結果完全可重現

## 4. 開發路線圖 (Roadmap)公開 API:

### Phase 1: 核心循環串接 (目前階段)```typescript

目標：完成 Inventory 與 Run Engine 的基礎實作，讓遊戲能從「開始」跑到「戰鬥結束」並「獲得獎勵」。import { CombatEngine, type CombatResult } from '@/modules/combat'

1.  Inventory 實作：建立基礎 CRUD，確認與 Combat 的 ID 對接機制。

2.  Run Engine 實作：建立狀態機，串接 Combat 與 Inventory。const combat = new CombatEngine()

3.  Encounter 實作：簡單的敵人生成。combat.initialize(teamA, teamB, config)

const result: CombatResult = combat.execute()

### Phase 2: 內容豐富化```

目標：增加遊戲的可玩性與變數。

1.  Reward & Shop：實作三選一與商店購買邏輯。---

2.  Event System：非戰鬥隨機事件。

### Replay 模組（回放系統）✅

### Phase 3: 深度與優化

目標：長期營運的基礎。定位: 事件驅動播放框架

1.  Persistence：完整的存檔讀檔。

2.  Death & Retry：完善的死亡懲罰與重試機制。架構:

3.  Content Expansion：大量新增遺物與技能（此時因架構優良，應可快速量產）。

- 分層依賴：infra → models → services → controllers → core (ReplayEngine)

---- 扁平架構，職責單純

## 5. 給 AI 的開發備忘錄職責:

- 關於 Inventory：當你被要求實作 Inventory 時，請記住它只是個容器。不要在裡面寫 `if (item.id === 'fire_sword') doDamage()`。這種邏輯請去 Combat 模組找 `Effect` 或 `Equipment` 的定義。- 輸入：`CombatResult`（來自 Combat 模組）

- 關於 Run Engine：這是最容易變亂的地方。請嚴格遵守狀態機邏輯，不要用大量的 boolean flag (`isFighting`, `isShopping`) 來管理狀態，請用明確的 State Enum。- 輸出：時間軸播放控制、事件流（供 UI 訂閱）

- 關於代碼品質：保持 KISS (Keep It Simple, Stupid)。如果一個功能需要引入三個新的 Design Pattern 才能解決，通常代表設計錯了。- 特性：支援速度控制、暫停/繼續、跳轉、循環播放

公開 API:

```typescript
import { ReplayEngine, PlaybackController } from '@/modules/replay'

const replay = new ReplayEngine(config)
replay.load(combatResult)
replay.on('replay:tick', (event) => {
  // UI 更新
})
replay.play()
```

為什麼 Replay 導出多個類別？

- 與 Combat 不同，Replay 是「框架」而非「引擎」
- 需要依賴注入（`ITickScheduler`、`IReplayEventEmitter`）
- 需要類型安全（`ReplayEventType`、`ReplayEvent`）
- 需要高階控制器（`PlaybackController`、`TimelineController`）

---

## 待實現模組（按優先級排序）

### 1. Run 模組（遊戲進程管理）🔨 優先級最高

定位: 遊戲主循環協調者

職責:

- 管理關卡進程（1-30 層 + 無盡模式）
- 協調 Combat、Reward、Shop、Event 等子系統
- 處理死亡/重試機制（時間回溯）
- 維護遊戲狀態（樓層、死亡次數、玩家隊伍）

核心挑戰:

- 異步狀態機（戰鬥、UI 輸入都是異步）
- 狀態回滾（死亡重試需要回到戰前）
- 狀態持久化（需要可序列化整個遊戲進度），[戰鬥內無法存檔，先這樣設定]

預期 API:

```typescript
import { RunEngine } from '@/modules/run'

const run = new RunEngine()
run.startNewRun(config)

while (!run.isCompleted()) {
  const encounter = run.advanceFloor()
  const combatResult = await combat.execute(...)

  if (combatResult.isDefeat) {
    run.handleDeath()  // 回滾 + 補償
  } else {
    const reward = await run.selectReward()
  }
}
```

---

### 2. Inventory 模組（庫存與裝備管理）🔨 優先級高

定位: 裝備與遺物管理系統

職責:

- 管理裝備槽位（武器、頭盔、裝甲、項鍊，每槽限一件）
- 管理遺物（可無限堆疊）
- 提供效果聚合（計算所有裝備+遺物的總效果） -> 我以為這個是戰鬥引擎的職責(那邊應該有寫類似的代碼吧?) 然後實作效果在 combat-impl?!
- 支援裝備升級系統(這個可以先不用)

設計決策:

- 方案 A：遺物只改數值（+10% 攻擊力）→ 簡單 CRUD
- 方案 B：遺物改變機制（攻擊吸血、死亡重生）→ 需要 Effect 系統

核心挑戰:

- 需要遺物效果「動態注入」到 Combat 引擎 (這個我想辦法找最佳解答)
- 效果優先級與互動規則（多個遺物同時觸發時的順序）-> 我以為這個是戰鬥引擎的職責
- 狀態序列化（遺物可能有內部狀態）-> 我以為這個是戰鬥引擎的職責

預期 API:

```typescript
import { InventoryManager } from '@/modules/inventory'

const inventory = new InventoryManager()
inventory.equipItem(sword, 'weapon')
inventory.addRelic(strengthRing)

const effects = inventory.getAllActiveEffects() // 供 Combat 使用
```

---

### 3. Encounter 模組（敵人生成）🔨 優先級高

定位: 戰鬥遭遇生成器

職責:

- 根據樓層生成敵人隊伍
- 計算難度係數（屬性縮放）
- 區分遭遇類型（普通/小 Boss/大 Boss）

核心邏輯:

```typescript
import { EncounterEngine } from '@/modules/encounter'

const encounter = new EncounterEngine()
const enemies = encounter.generate({
  floor: 15,
  type: 'mini-boss',
  difficultyMultiplier: 2.5,
})
```

---

### 4. Reward 模組（獎勵系統）🔨

職責: 關卡結束後的三選一獎勵生成

```typescript
import { RewardEngine } from '@/modules/reward'

const rewards = rewardEngine.generateRewards(floor)
// → [Item, Item, Item]

const selected = await waitForPlayerChoice(rewards)
inventory.addItem(selected)
```

---

### 5. Shop 模組（商店系統）🔨

職責: 商店商品生成、價格計算、購買邏輯

```typescript
import { ShopEngine } from '@/modules/shop'

const shop = new ShopEngine()
shop.generateShop(floor)
shop.purchaseItem(itemId, playerGold)
shop.refreshShop() // 死亡時刷新
shop.addCompensationBox() // 死亡補償盲盒
```

---

### 6. Event 模組（隨機事件）🔨

職責: 非戰鬥關卡的事件生成（寶箱、神龕、商人等）

```typescript
import { EventEngine } from '@/modules/event'

const event = eventEngine.generateEvent(floor)
const outcome = await eventEngine.resolveChoice(playerChoice)
```

---

### 7. Persistence 模組（存檔系統）🔨

職責: 遊戲狀態的序列化、保存、載入、版本遷移

核心挑戰:

- 深拷貝與循環引用處理
- 類實例序列化（需要自訂 `toJSON`/`fromJSON`）
- 版本遷移策略（V1.0 存檔如何讀入 V1.1？）

```typescript
import { PersistenceEngine } from '@/modules/persistence'

const save = await persistence.saveGame({
  runState: run.getState(),
  inventory: inventory.serialize(),
})

const loadedSave = await persistence.loadGame(saveId)
```

---

## 模組依賴關係圖

```
UI 層
 └─> Run Engine (遊戲主循環)
      ├─> Combat Engine (戰鬥執行)
      │    └─> Inventory (獲取角色效果)
      ├─> Replay Engine (戰鬥回放)
      ├─> Encounter Engine (敵人生成)
      ├─> Reward Engine (獎勵生成)
      ├─> Shop Engine (商店系統)
      ├─> Event Engine (隨機事件)
      └─> Persistence Engine (存檔)
           └─> 保存所有模組狀態
```

---

## 開發路線圖

### Phase 1: 核心循環（優先）

1. ✅ Combat Engine
2. ✅ Replay Engine
3. 🔨 Inventory Manager（簡化版，先不做遺物效果）
4. 🔨 Run Engine（基礎版，30 層線性推進）
5. 🔨 Encounter Engine（隨機敵人生成）

目標: 跑通一局完整遊戲（30 關戰鬥 → 勝利/失敗）

### Phase 2: 內容擴充

6. 🔨 Reward System（三選一獎勵）
7. 🔨 Shop System（商店購買）
8. 🔨 Event System（隨機事件）

目標: 玩家有「選擇」的樂趣

### Phase 3: 深度與持久化

9. 🔨 Inventory（遺物效果系統）
10. 🔨 Death & Retry（死亡重試機制）
11. 🔨 Persistence（存檔系統）
12. 🔨 Endless Mode（無盡模式）

目標: 深度和可重複性
