# 遊戲開發待辦事項

## 已完成

- [x] PostCombatCoordinationService 介面與框架
- [x] RunCoordinationService 介面與框架
- [x] StageInitializationService 介面與框架

---

## 🔴 優先級：必須完成（阻塞遊戲流程）

### 1. 戰鬥前上下文處理器

**文件位置**：`src/application/features/pre-combat/PreCombatContextHandler.ts`

**職責**：

- 管理戰鬥前上下文的讀寫操作
- 驗證戰鬥前狀態合法性（敵人是否存在、玩家狀態是否合法）
- 協調上下文與領域模型的轉換

**需完成的介面與方法**：

- `IPreCombatContextHandler`
  - `getPreCombatContext(): PreCombatContext | undefined`
  - `validatePreCombatState(): Result<void, string>`
  - `loadPreCombatDomainContexts(): { character: Character; enemy: Enemy }`
  - `updatePreCombatContext(updatedContext: PreCombatContext): void`
  - `commitPreCombatChanges(updates: any): Result<void>`

**實作建議**：

- 與 PostCombatContextHandler 結構類似
- 使用 temporaryContext.preCombat 存儲上下文
- 驗證敵人記錄有效性

---

### 2. 事件系統

**文件位置**：`src/application/features/event/`

**需建立的結構**：

#### 2.1 Event Domain Model

`src/domain/event/Event.ts`

- 事件模板（EventTemplate）：定義事件類型、選項、效果
- 事件聚合（EventAggregate）：EventTemplate + 當前狀態

事件類型建議：

- `RESOURCE`：給予資源（金幣、物品）
- `CURSE`：施加詛咒（負面效果）
- `CHOICE`：玩家選擇（多選一）
- `ENCOUNTER`：遭遇特殊事件（如商人）

#### 2.2 Event 靜態配置

`src/data/event/event.data.ts`

- 所有可用事件定義
- 事件選擇機率

#### 2.3 Event 處理服務

`src/application/features/event/EventProcessorService.ts`

**介面**：

```typescript
export interface IEventProcessorService {
  /**
   * 選擇並處理事件
   * @param stageNumber 關卡編號，用於機率計算
   * @returns 事件結果
   */
  selectAndProcessEvent(stageNumber: number): Result<EventProcessResult, string>
}

export interface EventProcessResult {
  readonly eventId: string
  readonly eventType: string
  readonly selectedOption?: number // 如果是選擇事件，記錄玩家選擇
  readonly effects: EventEffect[] // 此事件造成的效果
}

export interface EventEffect {
  readonly type: 'ADD_GOLD' | 'ADD_ITEM' | 'ADD_CURSE' | 'OTHER'
  readonly value: any
}
```

**需完成的方法**：

- `selectAndProcessEvent(stageNumber: number)`：選擇隨機事件
- `processResourceEvent(event: EventTemplate)`：處理資源事件
- `processCurseEvent(event: EventTemplate)`：處理詛咒事件
- `processChoiceEvent(event: EventTemplate, playerChoice: number)`：處理選擇事件

---

### 3. 遊戲循環協調器

**文件位置**：`src/application/game-loop/GameLoopCoordinationService.ts`

**職責**：

- 協調整個遊戲循環（新增 Run → 推進關卡 → 戰鬥 → 派發獎勵 → 檢查結束）
- 提供高層 API 入口供 BFF/Controller 呼叫
- 錯誤時進行合適的補償邏輯

**介面**：

```typescript
export interface IGameLoopCoordinationService {
  /**
   * 開始新的 Run
   */
  startNewRun(params: RunInitializationParams): Result<void, string>

  /**
   * 推進到下一關卡並初始化
   */
  advanceToNextStage(stageNumber: number): Result<void, string>

  /**
   * 領獎並推進
   */
  claimRewardsAndAdvance(params: { selectedRewardIndexes: number[]; nextStageNumber: number }): Result<void, string>

  /**
   * 處理失敗重試
   */
  handleRetry(): Result<void, string>

  /**
   * 結束 Run
   */
  endRun(): Result<void, string>
}
```

**需完成的方法**：

- `startNewRun()`：初始化 Run + 初始化第一關
- `advanceToNextStage()`：推進 + 初始化新關
- `claimRewardsAndAdvance()`：領獎 + 推進
- `handleRetry()`：失敗重試邏輯
- `endRun()`：結束 Run 並清理上下文

---

### 4. Run 完成檢查器

**文件位置**：`src/application/run-lifecycle/RunCompletionChecker.ts`

**職責**：

- 判斷 Run 是否滿足完成條件
- 判斷 Run 是否應該被終止（失敗）

**介面**：

```typescript
export interface IRunCompletionChecker {
  /**
   * 檢查 Run 是否已完成（通過所有章節）
   */
  isRunCompleted(run: Run): boolean

  /**
   * 檢查 Run 是否應該終止（玩家死亡或失敗重試耗盡）
   */
  shouldTerminateRun(run: Run): boolean

  /**
   * 取得完成理由
   */
  getCompletionReason(run: Run): 'COMPLETED' | 'FAILED' | 'ONGOING'
}
```

**需完成的方法**：

- `isRunCompleted()`：檢查是否完成所有章節
- `shouldTerminateRun()`：檢查重試次數是否耗盡
- `getCompletionReason()`：取得完成狀態

---

## 🟡 優先級：推薦完成（增強體驗）

### 5. 商店刷新協調

**檔案**：`src/application/features/shop/coordinator/ShopCoordinationService.ts`

**職責**：

- 協調商店刷新與貨幣消耗
- 確保刷新時的物品生成規則遵循配置

### 6. 倉庫容量管理

**檔案**：`src/application/features/stash/StashCapacityManager.ts`

**職責**：

- 檢查倉庫是否滿載
- 提供升級倉庫容量的邏輯

### 7. 屬性聚合系統增強

**檔案**：`src/application/content-generation/service/stats/StatsAggregationService.ts`

**職責**：

- 聚合所有影響屬性的因素（詞綴、裝備、聖物）
- 計算最終屬性值

---

## 🟠 優先級：未來擴展（不影響基本遊玩）

### 8. 成就系統

**檔案**：`src/application/features/achievement/`

### 9. 統計追蹤系統

**檔案**：`src/application/features/statistics/`

### 10. 角色升級系統

**檔案**：`src/application/features/character-progression/`

---

## 📋 實作順序建議

**第 1 天（今天）**：

- [ ] PostCombatCoordinationService 完全實作
- [ ] RunCoordinationService 完全實作
- [ ] StageInitializationService 框架完成（不實作細節）

**第 2 天**：

- [ ] PreCombatContextHandler 完全實作
- [ ] StageInitializationService 完全實作（整合敵人生成）
- [ ] 基礎事件系統框架

**第 3 天**：

- [ ] 事件系統完整實作
- [ ] GameLoopCoordinationService 實作
- [ ] RunCompletionChecker 實作

**第 4 天**：

- [ ] 整合測試與除錯
- [ ] 確保遊戲循環完整可玩

---

## 依賴關係圖

```
GameLoopCoordinationService
├─ RunInitializationService
├─ RunCoordinationService
│  ├─ RunService
│  └─ StageInitializationService
│     ├─ EnemyRandomGenerateService
│     └─ EventProcessorService
├─ PostCombatCoordinationService
│  ├─ PostCombatProcessor
│  └─ RewardFactory
└─ RunCompletionChecker
```

---

## 備註

- 所有新服務應遵循「介面優先」原則
- 所有公開方法應有詳細的 Docstring 說明職責與邊界
- 暫未實作的方法需標註 `// TODO:` 說明應做的事
- 保持單向依賴：高層協調層 → 中層服務 → 低層領域模型
