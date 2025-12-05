# Run 模組規格書 v0.1（前瞻設計）

## 一、目標功能與範圍

### 核心目標

管理單次 RogueLite 遊玩流程（Run），從第 1 層到第 n 層，處理關卡推進、戰鬥觸發、死亡重試、場景切換、存檔讀檔。

### 會實現的功能

- 關卡進度管理（當前層數、章節）
- 戰鬥觸發與結果處理
- 路線選擇（章節內 2~3 條路線）
- 死亡與重試流程
- 遊戲狀態存檔/讀檔委派
- 場景切換（戰鬥、商店、事件）
- 難度係數計算

### 不會實現的功能

- 戰鬥運算（由 Combat 模組負責）
- 戰鬥回放（由 Replay 模組負責）
- 敵人生成（由 Creature 模組負責）
- 裝備生成（由 Equipment 模組負責）
- 獎勵生成（由 Reward 模組負責）
- 商店邏輯（由 Shop 模組負責）
- 存檔實作（由 PersistentStorage 模組負責）

---

## 二、架構與元件關係

### 入口層

- `RunEngine`：Facade，管理整個 Run 生命週期

### 狀態層

- `RunState`：當前 Run 狀態（層數、章節、路線、玩家狀態）
- `RunStateMachine`：場景狀態機（idle → combat → reward → event → shop）

### 進度層

- `FloorManager`：關卡進度追蹤，Boss 關卡判定
- `ChapterManager`：章節管理，路線選擇

### 戰鬥整合層

- `CombatBridge`：呼叫 CombatEngine，處理戰鬥結果
- `ReplayBridge`：呼叫 ReplayEngine，播放戰鬥

### 存檔層

- `RunPersistence`：委派 PersistentStorage，處理存/讀檔

### 事件層

- `RunEventBus`：Run 專屬事件中心

---

## 三、核心概念

### 關卡結構

- 每 10 層為一章節
- 第 5、10 層為 Boss 關卡（必經）
- 每章節提供 2~3 條路線選擇
- 超過 30 層進入無盡模式

### 房間類型

- `combat` — 一般敵人戰鬥
- `elite` — 菁英敵人戰鬥（更難、獎勵更好）
- `boss` — Boss 戰鬥
- `event` — 隨機事件
- `shop` — 商店（可隨時進入，不佔房間）

### 場景流程

```
開始 Run
  ↓
選擇路線（每章節開始）
  ↓
進入房間 → 戰鬥/事件
  ↓
戰鬥結束 → 獎勵結算
  ↓
下一層 or 死亡重試
  ↓
章節結束 → 下一章節 or 遊戲結束
```

### 死亡與重試

- 若持有復活道具，可復活一次
- 死亡後回到戰鬥前狀態
- 商店老闆給予一次免費賭博
- 允許玩家自由 save/load

---

## 四、對外暴露的主要功能

### RunEngine API

```
RunEngine(config: RunConfig)
  .startNewRun(): void
  .loadRun(saveData: RunSaveData): void
  .getCurrentState(): RunState
  .selectRoute(routeIndex: number): void
  .enterRoom(roomIndex: number): void
  .startCombat(): CombatResult
  .playReplay(result: CombatResult): void
  .claimReward(): void
  .openShop(): void
  .saveRun(): RunSaveData
  .on(event, handler): void
  .dispose(): void
```

### RunConfig 輸入

- `player: ICharacter` — 玩家角色
- `seed?: string` — 隨機種子（可選）
- `startFloor?: number` — 起始層數（預設 1）

### RunState 輸出

- `floor: number` — 當前層數
- `chapter: number` — 當前章節（1~3+）
- `scene: 'idle' | 'combat' | 'reward' | 'event' | 'shop'`
- `routeOptions: RouteInfo[]` — 可選路線
- `currentRoute: RouteInfo | null` — 已選路線
- `playerSnapshot: CharacterSnapshot` — 玩家狀態
- `gold: number` — 金幣
- `inventory: Item[]` — 背包

### 事件類型

- `run:started` — 新 Run 開始
- `run:loaded` — 讀檔完成
- `run:floor-changed` — 進入新層
- `run:chapter-changed` — 進入新章節
- `run:route-selected` — 選擇路線
- `run:room-entered` — 進入房間
- `run:combat-started` — 戰鬥開始
- `run:combat-ended` — 戰鬥結束
- `run:player-died` — 玩家死亡
- `run:player-revived` — 玩家復活
- `run:reward-claimed` — 領取獎勵
- `run:game-over` — 遊戲結束（勝利或失敗）

---

## 五、與其他模組的關係

```
         ┌─────────────────┐
         │   RunEngine     │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
┌────────┐  ┌──────────┐  ┌──────────┐
│ Combat │  │ Creature │  │ Encounter│
│ Engine │  │ Module   │  │ Module   │
└────────┘  └──────────┘  └──────────┘
    ↓
┌────────┐
│ Replay │
│ Engine │
└────────┘
```

### 依賴方向

- RunEngine 呼叫 CombatEngine 執行戰鬥
- RunEngine 呼叫 ReplayEngine 播放戰鬥
- RunEngine 呼叫 Creature/Equipment 生成敵人/裝備
- RunEngine 呼叫 Encounter 生成關卡結構
- RunEngine 呼叫 PersistentStorage 存讀檔
- RunEngine 呼叫 Shop/Inventory 處理商店與背包

---

## 六、設計原則摘要

- **Facade**：RunEngine 單一入口
- **State Machine**：場景狀態管理
- **Bridge**：隔離 Combat/Replay 依賴
- **Observer**：事件驅動 UI 更新
- **低耦合**：透過介面依賴其他模組
