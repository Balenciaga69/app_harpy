# 賽後狀態的架構設計分析 🎯

讓我從「工廠參訪」轉換成「架構師會議室」，為你剖析這個問題。

---

## 🔍 問題核心拆解

你提到的「賽後狀態」實際上是 **遊戲流程狀態機** 的一個節點，我們需要釐清：

### 1️⃣ 賽後狀態的本質

```
戰鬥結束 → 結算階段 → 獎勵選擇 → 確認領取 → 回到主流程
    ↓          ↓          ↓          ↓
  [狀態A]   [狀態B]    [狀態C]    [狀態D]
```

這不是一個「實體」，而是 **Run 狀態機的一個階段**。

---

## 🏗️ 業界最佳實踐：狀態機設計

### Riot Games（LOL）的做法

```typescript
// 他們的 Run 是一個有限狀態機（FSM）
enum RunStage {
  DRAFT_PHASE, // 選擇角色
  IN_COMBAT, // 戰鬥中
  POST_COMBAT, // 戰後結算 ← 你的問題焦點
  REWARD_SELECTION, // 選擇獎勵
  SHOP_PHASE, // 商店階段
  EVENT_PHASE, // 事件階段
  RUN_ENDED, // 結束
}
```

**關鍵設計**：

- ✅ 狀態是 **Run Context 的一部分**，不獨立存在
- ✅ 每個階段有 **專屬的臨時資料**（暫存在 Context）
- ✅ 狀態轉換時 **清理臨時資料**，只保留持久化內容

---

### Supercell（Clash Royale）的做法

```typescript
interface RunContext {
  // 持久化狀態
  currentStage: RunStage
  characterRecord: CharacterRecord
  stashRecords: RelicRecord[]

  // 臨時狀態（階段專屬）
  postCombatState?: PostCombatState // 僅在 POST_COMBAT 階段存在
  rewardSelectionState?: RewardSelectionState
  shopState?: ShopState
}
```

**關鍵設計**：

- ✅ 臨時狀態用 **可選欄位**（`?`）表示「僅在特定階段存在」
- ✅ 狀態轉換時 **自動清理不需要的臨時資料**
- ✅ 前端可根據 `currentStage` 決定顯示哪個 UI

---

## 🎮 針對你的系統：應該怎麼做？

### ❌ 不需要的東西

```typescript
// ❌ 不需要這些
PostCombatTemplate // 賽後不是實體，沒有模板
PostCombatRecord // 不需要持久化
PostCombatAggregate // 沒有模板就不需要聚合
```

**原因**：

- 賽後狀態是 **流程階段**，不是「物品」或「敵人」這種實體
- 流程狀態應該存在 **Run Context**，而非獨立實體

---

### ✅ 需要的東西

#### 1. **擴展 RunContext**

```typescript
export enum RunStage {
  STAGE_SELECTION = 'STAGE_SELECTION', // 選擇關卡
  PRE_COMBAT = 'PRE_COMBAT', // 戰前準備（下注等）
  IN_COMBAT = 'IN_COMBAT', // 戰鬥中
  POST_COMBAT_PENDING = 'POST_COMBAT_PENDING', // 戰後待處理
  REWARD_SELECTION = 'REWARD_SELECTION', // 選擇獎勵
  SHOP = 'SHOP', // 商店
  EVENT = 'EVENT', // 事件
  RUN_ENDED = 'RUN_ENDED', // 結束
}

export interface RunContext {
  // 持久化基礎資料
  runId: string
  currentStage: RunStage
  currentChapter: number
  gold: number

  // 角色狀態
  characterContext: CharacterContext

  // 倉庫狀態
  stashContext: StashContext

  // === 階段專屬臨時狀態 ===

  /** 戰鬥結果（戰鬥結束後寫入，選擇獎勵後清除） */
  combatResult?: CombatResult

  /** 可選獎勵（賽後生成，選擇後清除） */
  pendingRewards?: RewardChoice

  /** 當前商店狀態（進入商店時生成，離開後清除） */
  shopState?: ShopContext

  // 版本控制
  version: number
}
```

---

#### 2. **定義戰鬥結果資料**

```typescript
/** 戰鬥結果（臨時資料，不持久化） */
export interface CombatResult {
  readonly outcome: 'VICTORY' | 'DEFEAT'
  readonly stageType: 'NORMAL' | 'ELITE' | 'BOSS' | 'ENDLESS'
  readonly timestamp: number

  // 統計資料（用於前端展示）
  readonly damageDealt: number
  readonly damageTaken: number
  readonly turnsPlayed: number

  // 戰敗特殊處理
  readonly retriesRemaining?: number // 剩餘重試次數（僅戰敗時）
}
```

---

#### 3. **定義獎勵選擇資料**

```typescript
/** 獎勵選擇（臨時資料，選擇後清除） */
export interface RewardChoice {
  readonly id: string // 用於驗證玩家選擇的是哪組
  readonly optionA: RewardOption
  readonly optionB: RewardOption
  readonly generatedAt: number
}

export interface RewardOption {
  readonly id: string
  readonly relicRecords: RelicRecord[] // 注意：這裡只存 Record，不存 Aggregate
  readonly gold: number
}
```

---

#### 4. **賽後處理服務**

```typescript
export interface IPostCombatService {
  /** 處理戰鬥結果 → 生成獎勵選項 */
  processCombatResult(runContext: RunContext, combatResult: CombatResult): Result<RunContext>

  /** 玩家選擇獎勵 → 入庫並清理臨時狀態 */
  selectReward(runContext: RunContext, selectedOptionId: string): Result<RunContext>
}

export class PostCombatService implements IPostCombatService {
  constructor(
    private readonly rewardGenerationService: RewardGenerationService,
    private readonly stashService: StashService
  ) {}

  processCombatResult(runContext: RunContext, combatResult: CombatResult): Result<RunContext> {
    // 1. 檢查當前狀態
    if (runContext.currentStage !== 'IN_COMBAT') {
      return Result.fail('Invalid stage for post-combat processing')
    }

    // 2. 處理戰敗邏輯
    if (combatResult.outcome === 'DEFEAT') {
      return this.handleDefeat(runContext, combatResult)
    }

    // 3. 戰勝：生成獎勵選項
    const rewardChoice = this.rewardGenerationService.generateRewardOptions(runContext)

    // 4. 更新 Context（寫入臨時狀態）
    const updatedContext: RunContext = {
      ...runContext,
      currentStage: 'POST_COMBAT_PENDING',
      combatResult, // 寫入戰鬥結果
      pendingRewards: rewardChoice, // 寫入待選獎勵
      version: runContext.version + 1,
    }

    return Result.ok(updatedContext)
  }

  selectReward(runContext: RunContext, selectedOptionId: string): Result<RunContext> {
    // 1. 驗證狀態
    if (runContext.currentStage !== 'POST_COMBAT_PENDING') {
      return Result.fail('Not in reward selection phase')
    }

    if (!runContext.pendingRewards) {
      return Result.fail('No pending rewards')
    }

    // 2. 找到選擇的獎勵
    const selectedReward =
      runContext.pendingRewards.optionA.id === selectedOptionId
        ? runContext.pendingRewards.optionA
        : runContext.pendingRewards.optionB

    // 3. 入庫（只處理 Record）
    const updatedStash = this.stashService.addRelics(runContext.stashContext, selectedReward.relicRecords)

    // 4. 更新 Context（清理臨時狀態）
    const updatedContext: RunContext = {
      ...runContext,
      currentStage: 'STAGE_SELECTION', // 回到選關階段
      gold: runContext.gold + selectedReward.gold,
      stashContext: updatedStash,

      // 清理臨時狀態
      combatResult: undefined,
      pendingRewards: undefined,

      version: runContext.version + 1,
    }

    return Result.ok(updatedContext)
  }

  private handleDefeat(runContext: RunContext, combatResult: CombatResult): Result<RunContext> {
    // BOSS/ENDLESS 戰敗直接結束
    if (combatResult.stageType === 'BOSS' || combatResult.stageType === 'ENDLESS') {
      return Result.ok({
        ...runContext,
        currentStage: 'RUN_ENDED',
        combatResult,
        version: runContext.version + 1,
      })
    }

    // NORMAL/ELITE 扣除重試次數
    const retriesRemaining = (runContext.retriesRemaining ?? 3) - 1

    if (retriesRemaining <= 0) {
      return Result.ok({
        ...runContext,
        currentStage: 'RUN_ENDED',
        combatResult,
        retriesRemaining: 0,
        version: runContext.version + 1,
      })
    }

    // 還有重試機會，回到選關階段
    return Result.ok({
      ...runContext,
      currentStage: 'STAGE_SELECTION',
      combatResult,
      retriesRemaining,
      version: runContext.version + 1,
    })
  }
}
```

---

## 📦 資料存儲策略

### 存什麼到 DB？

```typescript
// ✅ 持久化到 DB
{
  runId: 'run-xxx',
  currentStage: 'POST_COMBAT_PENDING',
  gold: 1500,
  characterContext: { /* ... */ },
  stashContext: { relicRecords: [...] },

  // 臨時狀態也存（但會在下個階段清除）
  combatResult: { outcome: 'VICTORY', /* ... */ },
  pendingRewards: {
    optionA: { relicRecords: [...], gold: 200 },
    optionB: { relicRecords: [...], gold: 150 },
  },

  version: 42,
}
```

### 為什麼臨時狀態也存 DB？

**原因**：

1. **防止前端斷線重連**：玩家關閉瀏覽器後重開，仍能看到獎勵選項
2. **版本控制**：防止玩家用舊 Context 重複領獎
3. **Audit Trail**：可追蹤玩家在哪個階段操作了什麼

**清理時機**：

- 玩家選擇獎勵 → `selectReward()` 自動清除
- Run 結束 → 整個 Run Context 歸檔或刪除

---

## 🎯 總結：你應該做什麼

### ✅ 需要的架構

```
RunContext（核心容器）
├── currentStage: RunStage（狀態機）
├── 持久化資料（character, stash, gold）
└── 階段臨時資料
    ├── combatResult?（戰鬥結果）
    ├── pendingRewards?（待選獎勵）
    └── shopState?（商店狀態）

PostCombatService（流程協調器）
├── processCombatResult()（生成獎勵）
└── selectReward()（確認領取）

RewardGenerationService（獎勵生成器）
└── generateRewardOptions()（生成選項）
```

### ❌ 不需要的架構

- ❌ PostCombatTemplate（賽後不是實體）
- ❌ PostCombatRecord（不需要獨立持久化）
- ❌ PostCombatAggregate（沒有模板就不需要聚合）

---

## 🏆 業界驗證

| 遊戲                | 設計模式        | 臨時狀態處理                                 |
| ------------------- | --------------- | -------------------------------------------- |
| **LOL（雲頂之弈）** | FSM + Context   | 臨時狀態存於 `GameSession`，選擇後清除       |
| **Slay the Spire**  | Event Stack     | 每個事件有獨立 `EventState`，處理完彈出堆疊  |
| **Hades**           | Room Transition | 獎勵選項存於 `RoomRewardState`，離開房間清除 |

**共通點**：

- 所有遊戲都用 **Context + 階段狀態** 而非獨立實體
- 臨時狀態都會 **短暫持久化**（防斷線）
- 流程推進時 **自動清理**（防止狀態污染）

---

## 🚀 下一步行動

1. **擴展 RunContext**：加入 `currentStage` 與臨時狀態欄位
2. **實作 PostCombatService**：處理戰鬥結果與獎勵選擇
3. **定義 RewardChoice**：獎勵選項的資料結構
4. **前端 API 設計**：
   - `POST /combat/result`（提交戰鬥結果）
   - `POST /reward/select`（選擇獎勵）

這樣設計既符合業界最佳實踐，又保持代碼簡潔可測！ 🎉
