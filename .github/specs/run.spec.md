# Run 模組規格書

## 一、目標功能與範圍

### 核心目標

管理整個遊戲流程的中樞系統，負責狀態協調、進度追蹤與模組間的通訊，確保玩家從開局到結束的遊戲體驗流暢進行。

### 會實現的功能

- 遊戲狀態管理（角色選擇、地圖瀏覽、戰前準備、戰鬥、結算、商店、事件等）
- 流程狀態轉換控制與驗證
- 關卡進度追蹤（章節、節點、總關卡數、無盡模式判定）
- 難度係數計算與管理
- 玩家資源管理（金幣增減）
- 與其他模組的協調介面（透過 Coordinators）
- Run 生命週期管理（初始化、存讀檔、結束處理）
- 續命機制處理

### 不會實現的功能

- 戰鬥運算邏輯（由 CombatEngine 負責）
- 角色屬性計算（由 CharacterModifierSystem 負責）
- 裝備與遺物生成（由 ItemGenerator 負責）
- 敵人生成（由 EnemyGenerator 負責）
- 商店商品管理（由 Shop 負責）
- 關卡地圖生成（由 Encounter 負責）
- 實際存檔操作（由 PersistentStorage 負責）
- UI 渲染與互動（由 React 元件負責）

---

## 二、架構與元件關係

### 入口層

- `RunOrchestrator`：Facade，唯一對外介面，協調所有子系統

### 資料層

- `RunContext`：Run 的完整上下文資料（runId、狀態、進度、角色、金幣、續命道具等）
- `RunProgress`：進度資訊（章節、節點、總關卡數、無盡模式、難度係數）
- `RunState`：流程狀態枚舉

### 狀態機層

- `RunStateMachine`：狀態機實作，管理狀態轉換
- `IRunStateHandler`：狀態處理器介面
- 各狀態處理器：
  - `CharacterSelectionState`：角色選擇
  - `MapViewState`：地圖瀏覽
  - `PreCombatState`：戰前準備
  - `CombatState`：戰鬥中
  - `PostCombatState`：戰後結算
  - `ShopState`：商店
  - `EventState`：事件觸發
  - `GameOverState`：遊戲結束
  - `VictoryState`：勝利

### 協調層

- `CharacterCoordinator`：與 CharacterManager 協調
- `EncounterCoordinator`：與 Encounter 模組協調
- `CombatCoordinator`：與 CombatEngine 協調
- `ShopCoordinator`：與 Shop 模組協調
- `StorageCoordinator`：與 PersistentStorage 協調

### 生命週期層

- `RunInitializer`：Run 初始化
- `RunFinalizer`：Run 結束處理

### 錯誤層

- `RunError`：基礎錯誤類別
- `InvalidStateTransitionError`：非法狀態轉換錯誤
- `RunNotInitializedError`：未初始化錯誤
- `InvalidRunOperationError`：無效操作錯誤

---

## 三、對外暴露的主要功能

### RunOrchestrator API

```
RunOrchestrator()
  .startNewRun(): void
  .loadCheckpoint(checkpointId: string): Promise<void>
  .saveCheckpoint(): Promise<void>
  .selectCharacter(characterId: string): void
  .transitionTo(newState: RunState): Promise<void>
  .advanceNode(): void
  .getCurrentState(): RunState
  .getCurrentProgress(): RunProgress
  .getContext(): Readonly<RunContext>
  .addGold(amount: number): void
  .spendGold(amount: number): boolean
  .endRun(isVictory: boolean): void
  .getCoordinators(): Coordinators
```

### RunState 枚舉

- `UNINITIALIZED`：未初始化
- `CHARACTER_SELECTION`：角色選擇
- `MAP_VIEW`：地圖瀏覽
- `PRE_COMBAT`：戰前準備
- `COMBAT`：戰鬥中
- `POST_COMBAT`：戰後結算
- `SHOP`：商店
- `EVENT`：事件觸發
- `GAME_OVER`：遊戲結束
- `VICTORY`：勝利

### RunContext 輸出

- `runId: string`：唯一識別碼
- `state: RunState`：當前狀態
- `progress: RunProgress`：進度資訊
- `characterId: string | null`：選擇的角色 ID
- `gold: number`：玩家金幣
- `hasReviveItem: boolean`：是否有續命道具
- `startedAt: number`：開始時間戳
- `updatedAt: number`：最後更新時間戳

### RunProgress 輸出

- `chapter: number`：當前章節
- `node: number`：當前節點（1-10）
- `totalNodesCleared: number`：總通關數
- `isEndlessMode: boolean`：是否無盡模式
- `difficultyScale: number`：難度係數

---

## 四、核心設計模式

### Facade Pattern

`RunOrchestrator` 作為統一入口，隱藏內部複雜性，對外提供簡潔介面。

### State Pattern

每個狀態有獨立的處理器類別，實作 `IRunStateHandler` 介面，定義進入、離開與允許轉換的邏輯。

### Mediator Pattern

Coordinators 作為中介者，封裝與其他模組的互動細節，降低 RunOrchestrator 與其他模組的耦合。

---

## 五、狀態轉換規則

```
UNINITIALIZED
  → CHARACTER_SELECTION

CHARACTER_SELECTION
  → MAP_VIEW
  → UNINITIALIZED

MAP_VIEW
  → PRE_COMBAT
  → SHOP
  → EVENT
  → GAME_OVER

PRE_COMBAT
  → COMBAT
  → MAP_VIEW

COMBAT
  → POST_COMBAT
  → GAME_OVER

POST_COMBAT
  → MAP_VIEW
  → SHOP
  → VICTORY

SHOP
  → MAP_VIEW
  → PRE_COMBAT

EVENT
  → MAP_VIEW
  → SHOP

GAME_OVER
  → SHOP (續命)
  → UNINITIALIZED (重新開始)

VICTORY
  → UNINITIALIZED
```

---

## 六、典型流程範例

### 新遊戲流程

1. `startNewRun()` 建立新 Run，狀態 → `CHARACTER_SELECTION`
2. `selectCharacter(id)` 選擇角色
3. `transitionTo(MAP_VIEW)` 進入地圖
4. 玩家選擇節點，`transitionTo(PRE_COMBAT)`
5. 戰前準備完成，`transitionTo(COMBAT)`
6. 戰鬥執行完成，`transitionTo(POST_COMBAT)`
7. 結算完成，`advanceNode()` 推進進度
8. `transitionTo(MAP_VIEW)` 回到地圖
9. 重複 4-8 直到遊戲結束

### 續命流程

1. 戰鬥失敗，`transitionTo(GAME_OVER)`
2. 檢查 `context.hasReviveItem`
3. 若有，消耗道具，`transitionTo(SHOP)`
4. 若無，`endRun(false)` 結束遊戲

---

## 七、依賴關係

### Run 依賴（單向）

- CharacterManager
- Encounter
- PreCombat
- CombatEngine
- Shop
- Inventory
- DifficultyScaler
- PersistentStorage

### 被依賴

- UI 層 → Run（查詢狀態與進度）
- PersistentStorage → Run（序列化 Run 數據）

---

## 八、擴展性考量

### 新增狀態

建立新的 State 類別實作 `IRunStateHandler`，註冊到 `RunStateMachine`。

### 新增協調器

建立新的 Coordinator 類別，加入 `RunOrchestrator` 建構子。

### 跨語言移植

無框架耦合，純邏輯設計，可直接遷移至 C#、Python、Go 等語言。
