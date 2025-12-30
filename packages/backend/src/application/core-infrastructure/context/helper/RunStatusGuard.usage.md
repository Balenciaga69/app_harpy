# RunStatusGuard 使用手冊 📚

## 核心方法

### 1. `requireStatus()` - 最常用 ⭐⭐⭐⭐⭐

**用途**：要求 Run 必須處於**特定狀態**

**使用時機**：
- 開始戰鬥時（必須在 `STAGE_SELECTION`）
- 領取獎勵時（必須在 `POST_COMBAT_PENDING`）
- 進入商店時（必須在 `STAGE_SELECTION`）
- 任何需要「只能在某個狀態下執行」的操作

**範例**：
```typescript
class CombatService {
  async startCombat(runId: string) {
    const run = await this.getRunContext(runId)
    
    // ✅ 檢查必須在選關階段
    const result = this.guard.requireStatus(run, 'STAGE_SELECTION')
    if (result.isFailure) {
      return Result.fail('不在選關階段，無法開始戰鬥')
    }
    
    // 處理戰鬥邏輯...
  }
}
```

**回傳值**：
- `Result.success(undefined)` - 狀態正確
- `Result.fail(DomainErrorCode.Run_狀態不符)` - 狀態不符

---

### 2. `requireOneOfStatuses()` - 多狀態檢查 ⭐⭐⭐

**用途**：要求 Run 必須處於**多個狀態之一**

**使用時機**：
- 某些操作在多個狀態下都允許
- 例如：查詢背包（任何非戰鬥狀態都可以）
- 例如：查看角色屬性（除了 `RUN_ENDED` 都可以）

**範例**：
```typescript
class StashService {
  async viewStash(runId: string) {
    const run = await this.getRunContext(runId)
    
    // ✅ 只要不是戰鬥中或結束，都可以查看背包
    const result = this.guard.requireOneOfStatuses(run, [
      'STAGE_SELECTION',
      'SHOP',
      'EVENT',
      'POST_COMBAT_PENDING'
    ])
    
    if (result.isFailure) {
      return Result.fail('當前狀態無法查看背包')
    }
    
    // 回傳背包內容...
  }
}
```

---

### 3. `validateTransition()` - 顯式狀態轉換驗證 ⭐⭐

**用途**：檢查從當前狀態轉換到目標狀態**是否合法**

**使用時機**：
- 當你要「顯式地」轉換狀態時
- 適合在複雜的流程中使用

**範例**：
```typescript
class RunFlowService {
  async transitionTo(runId: string, nextStatus: RunStatus) {
    const run = await this.getRunContext(runId)
    
    // ✅ 驗證這個轉換是否合法
    const result = this.guard.validateTransition(run, nextStatus)
    if (result.isFailure) {
      return Result.fail(`無法從 ${run.status} 轉換到 ${nextStatus}`)
    }
    
    // 執行轉換...
    const updatedRun = {
      ...run,
      status: nextStatus,
      version: run.version + 1
    }
    
    await this.updateRunContext(updatedRun)
    return Result.success(updatedRun)
  }
}
```

**注意**：大多數情況下用 `requireStatus()` 就夠了，這個方法適合特殊場景。

---

### 4. `canTransitionTo()` - 純檢查（不返回 Result） ⭐

**用途**：檢查狀態轉換**是否合法**（返回 boolean）

**使用時機**：
- 前端 UI 判斷（例如：按鈕是否可點擊）
- 不需要 Result 包裝的簡單檢查

**範例**：
```typescript
class UIHelper {
  canEnterShop(run: IRunContext): boolean {
    // ✅ 簡單的 true/false 檢查
    return this.guard.canTransitionTo(run.status, 'SHOP')
  }
  
  getAvailableActions(run: IRunContext): string[] {
    const actions: string[] = []
    
    if (this.guard.canTransitionTo(run.status, 'SHOP')) {
      actions.push('進入商店')
    }
    if (this.guard.canTransitionTo(run.status, 'IN_COMBAT')) {
      actions.push('開始戰鬥')
    }
    
    return actions
  }
}
```

---

### 5. 便捷方法（語義化檢查）⭐⭐⭐⭐

#### `isRunEnded()`
**用途**：檢查 Run 是否已結束

```typescript
async someMethod(run: IRunContext) {
  if (this.guard.isRunEnded(run)) {
    return Result.fail('Run 已結束')
  }
  // ...
}
```

#### `isInCombat()`
**用途**：檢查是否在戰鬥中

```typescript
async pauseGame(run: IRunContext) {
  if (this.guard.isInCombat(run)) {
    return Result.fail('戰鬥中無法暫停')
  }
  // ...
}
```

#### `hasPendingRewards()`
**用途**：檢查是否有待領取的獎勵

```typescript
async checkRewards(run: IRunContext) {
  if (this.guard.hasPendingRewards(run)) {
    return { message: '你有未領取的獎勵' }
  }
  return { message: '沒有待領取獎勵' }
}
```

---

## 使用決策樹 🌲

```
需要檢查 Run 狀態？
    │
    ├─ 是 → 這個操作會改變 Run 流程？
    │       │
    │       ├─ 是 → 用 requireStatus() ✅
    │       │       例如：開始戰鬥、領取獎勵、進入商店
    │       │
    │       └─ 否 → 不需要 RunStatusGuard
    │               例如：裝備物品、整理背包、查看屬性
    │
    └─ 否 → 不需要 RunStatusGuard
            例如：Domain 層的業務邏輯
```

---

## 最佳實踐 ✨

### ✅ 應該做的

```typescript
// 1. 在 Application Service 中檢查狀態
class RewardService {
  private readonly guard = new RunStatusGuard()
  
  async claimReward(runId: string) {
    const run = await this.getRunContext(runId)
    
    // ✅ 檢查狀態
    const result = this.guard.requireStatus(run, 'POST_COMBAT_PENDING')
    if (result.isFailure) return result
    
    // 處理業務邏輯...
  }
}

// 2. 早期返回（Fail Fast）
async someMethod(run: IRunContext) {
  const result = this.guard.requireStatus(run, 'SHOP')
  if (result.isFailure) return result  // ← 立即返回
  
  // 只有狀態正確才會執行到這裡
}

// 3. 清晰的錯誤訊息
const result = this.guard.requireStatus(run, 'STAGE_SELECTION')
if (result.isFailure) {
  return Result.fail('請先完成當前階段再開始戰鬥')
}
```

### ❌ 不應該做的

```typescript
// ❌ 不要在 Domain Layer 使用
class Character {
  equipRelic(relic: Relic, run: IRunContext) {  // ← 錯誤！Domain 不該依賴 RunContext
    const result = this.guard.requireStatus(run, 'SHOP')  // ← 錯誤！
    // ...
  }
}

// ❌ 不要在不需要狀態檢查的地方使用
class StashService {
  async addItem(item: Item, run: IRunContext) {
    // ❌ 加入背包不需要檢查 Run 狀態
    const result = this.guard.requireStatus(run, 'STAGE_SELECTION')
    // ...
  }
}

// ❌ 不要重複檢查
async claimReward(run: IRunContext) {
  const result1 = this.guard.requireStatus(run, 'POST_COMBAT_PENDING')  // ← 檢查一次
  if (result1.isFailure) return result1
  
  const result2 = this.guard.requireStatus(run, 'POST_COMBAT_PENDING')  // ❌ 重複檢查
  // ...
}
```

---

## 完整範例：RewardService

```typescript
export class RewardService {
  private readonly guard = new RunStatusGuard()
  
  constructor(
    private readonly contextService: IAppContextService,
    private readonly stashService: StashService
  ) {}
  
  /**
   * 領取戰鬥獎勵
   */
  async claimReward(
    runId: string,
    rewardIndex: number
  ): Promise<Result<IRunContext, DomainErrorCode | ApplicationErrorCode>> {
    // 1️⃣ 讀取 Context
    const run = await this.contextService.getRunContext(runId)
    
    // 2️⃣ 狀態檢查（最重要的一步）
    const guardResult = this.guard.requireStatus(run, 'POST_COMBAT_PENDING')
    if (guardResult.isFailure) {
      return Result.fail(guardResult.error!)
    }
    
    // 3️⃣ 驗證獎勵存在
    if (!this.guard.hasPendingRewards(run)) {
      return Result.fail(ApplicationErrorCode.獎勵_沒有待領取獎勵)
    }
    
    const postCombat = run.temporaryContext.postCombat!
    const selectedReward = postCombat.detail.availableRewards[rewardIndex]
    
    if (!selectedReward) {
      return Result.fail(ApplicationErrorCode.獎勵_獎勵索引無效)
    }
    
    // 4️⃣ 業務邏輯：將物品加入背包
    const stashResult = await this.stashService.addManyItems(
      run.stashContext,
      selectedReward.itemRecords
    )
    
    if (stashResult.isFailure) {
      return Result.fail(stashResult.error!)
    }
    
    // 5️⃣ 更新 RunContext（狀態轉換 + 清理臨時資料）
    const updatedRun: IRunContext = {
      ...run,
      status: 'STAGE_SELECTION',  // ← 狀態轉換
      gold: run.gold + selectedReward.gold,
      stashContext: stashResult.value,
      temporaryContext: {
        postCombat: undefined  // ← 清理
      },
      version: run.version + 1
    }
    
    // 6️⃣ 持久化
    await this.contextService.updateRunContext(updatedRun)
    
    return Result.success(updatedRun)
  }
  
  /**
   * 查看可領取的獎勵（不改變狀態）
   */
  async viewAvailableRewards(runId: string): Promise<Result<CombatReward[]>> {
    const run = await this.contextService.getRunContext(runId)
    
    // ✅ 檢查狀態
    const guardResult = this.guard.requireStatus(run, 'POST_COMBAT_PENDING')
    if (guardResult.isFailure) {
      return Result.fail('沒有待領取的獎勵')
    }
    
    // 不需要改狀態，直接回傳
    const rewards = run.temporaryContext.postCombat!.detail.availableRewards
    return Result.success(rewards)
  }
}
```

---

## 總結

| 方法 | 使用頻率 | 適用場景 |
|------|---------|---------|
| `requireStatus()` | ⭐⭐⭐⭐⭐ | 90% 的情況下都用這個 |
| `requireOneOfStatuses()` | ⭐⭐⭐ | 多狀態允許的操作 |
| `validateTransition()` | ⭐⭐ | 顯式狀態轉換 |
| `canTransitionTo()` | ⭐ | UI 判斷、簡單檢查 |
| `isRunEnded()` / `isInCombat()` / `hasPendingRewards()` | ⭐⭐⭐⭐ | 語義化檢查 |

**記住這個原則**：
- ✅ **Application Service** 使用 RunStatusGuard
- ❌ **Domain Layer** 不使用
- ✅ **會改變 Run 流程的操作** 需要檢查狀態
- ❌ **單純的業務邏輯** 不需要檢查狀態
