# Run 模組規格書 v0.2（事件驅動架構）

## 一、目標功能與範圍

### 核心目標

管理單次 RogueLite 遊玩流程（Run），採用純事件驅動 + 狀態機架構，確保極低耦合與高可擴展性。

### RunEngine 只做幾件事

1. 維護 Floor / Chapter 進度
2. 提供路線選擇

- 極薄 Facade：RunEngine 核心短小精悍
- 純事件驅動：所有業務邏輯在外部 Handler
- 零直接依賴：RunEngine 不 import 任何業務模組
- 單向數據流：RunEngine → EventBus → Handler → RunState

3. 驅動場景狀態機

### 不在 RunEngine 內的功能（由獨立 Handler 處理）

- 戰鬥觸發與結果 → `CombatHandler`
- 死亡與重試 → `DeathHandler`
- 獎勵分發 → `RewardHandler`
- 存讀檔 → `PersistenceHandler`
- 難度計算 → `DifficultyHandler`
- 商店互動 → `ShopHandler`

---

## 二、架構與元件關係

### 核心層（RunEngine 直接持有）

```
RunEngine
  ├── RunEventBus      // 事件中心
  ├── RunStateMachine  // 場景狀態機
  ├── FloorManager     // 層數進度（純資料）
  └── ChapterManager   // 章節路線（純資料）
```

### Handler 層（透過事件訂閱，零耦合）

```
RunEventBus
  ├── CombatHandler      // 監聽 room:entered → 執行戰鬥 → emit combat:ended
  ├── ReplayHandler      // 監聽 combat:ended → 播放回放
  ├── RewardHandler      // 監聽 combat:victory → 發放獎勵
  ├── DeathHandler       // 監聽 combat:defeat → 處理死亡/復活
  ├── PersistenceHandler // 監聽 run:* 事件 → 自動存檔
  ├── DifficultyHandler  // 監聽 floor:changed → 更新難度係數
  └── AchievementHandler // （未來）監聽各種事件 → 解鎖成就
```

### 數據流

```
UI 操作
   ↓
RunEngine.selectRoute() / enterRoom()
   ↓
RunEventBus.emit('route:selected') / emit('room:entered')
   ↓
各 Handler 監聯並處理
   ↓
Handler 可能 emit 新事件 或 回寫 RunState
   ↓
RunStateMachine 根據事件跳轉狀態
   ↓
UI 訂閱狀態變化更新畫面
```

---

## 三、狀態機定義

### 場景狀態（RunStateMachine）

```
idle ──(start)──→ route_selection
                       │
         (route:selected)
                       ↓
                  room_preview
                       │
         (room:entered)
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
           combat            event
              │                 │
   (combat:ended)        (event:resolved)
              │                 │
              └────────┬────────┘
                       ↓
                    reward
                       │
            (reward:claimed)
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
         next_floor          game_over
              │
    (floor:changed)
              ↓
      route_selection (loop)
```

### 狀態說明

| 狀態              | 說明          |
| ----------------- | ------------- |
| `idle`            | 初始/結束狀態 |
| `route_selection` | 選擇章節路線  |
| `room_preview`    | 預覽房間內容  |
| `combat`          | 戰鬥進行中    |
| `event`           | 事件進行中    |
| `reward`          | 領取獎勵      |
| `next_floor`      | 進入下一層    |
| `game_over`       | 遊戲結束      |

---

## 四、事件契約

### RunEngine 發出的事件

| 事件              | 時機        | Payload                  |
| ----------------- | ----------- | ------------------------ |
| `run:started`     | 新 Run 開始 | `{ seed, floor }`        |
| `run:loaded`      | 讀檔完成    | `{ runState }`           |
| `route:selected`  | 選擇路線    | `{ routeIndex, rooms }`  |
| `room:entered`    | 進入房間    | `{ roomType, roomData }` |
| `floor:changed`   | 進入新層    | `{ floor, chapter }`     |
| `chapter:changed` | 進入新章節  | `{ chapter }`            |

### Handler 發出的事件

| 事件                 | 來源 Handler      | Payload            |
| -------------------- | ----------------- | ------------------ |
| `combat:started`     | CombatHandler     | `{ enemies }`      |
| `combat:ended`       | CombatHandler     | `{ result, logs }` |
| `combat:victory`     | CombatHandler     | `{ reward }`       |
| `combat:defeat`      | CombatHandler     | `{}`               |
| `player:died`        | DeathHandler      | `{ canRevive }`    |
| `player:revived`     | DeathHandler      | `{}`               |
| `reward:generated`   | RewardHandler     | `{ items, gold }`  |
| `reward:claimed`     | RewardHandler     | `{}`               |
| `difficulty:updated` | DifficultyHandler | `{ multiplier }`   |

---

## 五、對外暴露的主要功能

### RunEngine API（極簡）

```
RunEngine(eventBus: IEventBus)
  .start(config: RunConfig): void
  .load(state: RunState): void
  .getState(): RunState
  .selectRoute(index: number): void
  .enterRoom(index: number): void
  .dispose(): void
```

### RunState（純資料，可序列化）

```
{
  floor: number
  chapter: number
  scene: SceneState
  currentRoute: RouteInfo | null
  routeOptions: RouteInfo[]
  roomIndex: number
}
```

### 注意

- 沒有 `startCombat()`、`claimReward()` 等方法
- 這些邏輯由 Handler 自動處理
- RunEngine 只負責「進入房間」，後續流程由事件驅動

---

## 六、Handler 職責分離

### CombatHandler

- 監聽：`room:entered` (roomType === 'combat')
- 職責：呼叫 CombatEngine、emit 結果
- 發出：`combat:started`, `combat:ended`, `combat:victory/defeat`

### ReplayHandler

- 監聽：`combat:ended`
- 職責：呼叫 ReplayEngine 播放
- 發出：`replay:started`, `replay:ended`

### RewardHandler

- 監聽：`combat:victory`, `event:resolved`
- 職責：生成獎勵、更新玩家背包
- 發出：`reward:generated`, `reward:claimed`

### DeathHandler

- 監聽：`combat:defeat`
- 職責：檢查復活道具、處理死亡流程
- 發出：`player:died`, `player:revived`, `run:game-over`

### PersistenceHandler

- 監聽：`floor:changed`, `reward:claimed`, `run:*`
- 職責：自動存檔快照
- 發出：`save:completed`, `save:failed`

### DifficultyHandler

- 監聽：`floor:changed`
- 職責：計算難度係數
- 發出：`difficulty:updated`

---

## 七、關卡結構

### 基本規則

- 每 10 層為一章節
- 第 5、10 層為 Boss 關卡（必經）
- 每章節提供 2~3 條路線選擇
- 超過 30 層進入無盡模式

### 房間類型

| 類型     | 說明                       |
| -------- | -------------------------- |
| `combat` | 一般敵人戰鬥               |
| `elite`  | 菁英敵人（更難、獎勵更好） |
| `boss`   | Boss 戰鬥                  |
| `event`  | 隨機事件                   |

### 死亡與重試

- - 玩家死亡後會有死亡檢查機。
- 若玩家有 某種道具 則能復活機會，失敗將回到戰鬥前，並且商店老闆會給你一次賭博作為補償同時刷新商店內容。
- 否則直接進入本Run的Game Over狀態。
- 允許玩家自由 save/load

---

## 八、擴展性範例

### 新增成就系統

```typescript
class AchievementHandler {
  constructor(eventBus: IEventBus) {
    eventBus.on('combat:victory', this.checkCombatAchievements)
    eventBus.on('floor:changed', this.checkProgressAchievements)
  }
}
```

### 新增每日挑戰模式

```typescript
class DailyChallengeHandler {
  constructor(eventBus: IEventBus) {
    eventBus.on('run:started', this.applyDailyModifiers)
    eventBus.on('run:game-over', this.submitScore)
  }
}
```

完全不需要修改 RunEngine！

---

## 九、測試策略

```typescript
test('entering combat room emits room:entered', () => {
  const eventBus = new EventBus()
  const engine = new RunEngine(eventBus)
  const spy = jest.fn()

  eventBus.on('room:entered', spy)
  engine.start({ seed: 'test' })
  engine.selectRoute(0)
  engine.enterRoom(0)

  expect(spy).toHaveBeenCalledWith({ roomType: 'combat', ... })
})
```

不需要 mock Combat/Reward/Shop 等模組。

---

## 十、設計原則摘要

- 狀態機封裝：場景跳轉只在 StateMachine
- 開放封閉：新功能 = 新 Handler
- 極薄 Facade：RunEngine 核心短小精悍
- 純事件驅動：所有業務邏輯在外部 Handler
- 零直接依賴：RunEngine 不 import 任何業務模組
- 單向數據流：RunEngine → EventBus → Handler → RunState
