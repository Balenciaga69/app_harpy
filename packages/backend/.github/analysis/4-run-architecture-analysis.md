# 報告 4: Run 模型與服務架構分析

## 現狀概述

### 當前架構

```
┌─ Application Layer ─────────────────────┐
│                                          │
│  RunInitializationService                │
│  (創建、初始化 Run)                      │
│                                          │
│  ↓ (透過 IRunContextRepository)          │
│                                          │
│  Core Infrastructure                     │
│  ├─ ContextUnitOfWork                    │
│  ├─ AppContextService                    │
│  └─ IRunContextRepository                │
│                                          │
│  ↓                                       │
│                                          │
│  Domain: IRunContext                     │
│  (狀態數據結構)                          │
│                                          │
└──────────────────────────────────────────┘
```

### 當前 Run 的組成部分

#### 1. IRunContext 接口（Domain 層）

```typescript
interface IRunContext extends WithRunIdAndVersion {
  seed: number
  currentChapter: ChapterLevel
  currentStage: number
  encounteredEnemyIds: string[]
  chapters: Record<ChapterLevel, ChapterInfo>
  rollModifiers: ItemRollModifier[]
  remainingFailRetries: number
  status: RunStatus
  temporaryContext: { postCombat?: PostCombatContext }
}
```

**評估**: ✅ 數據結構清晰，已包含所有必要字段

#### 2. 服務層

- `RunInitializationService` - 初始化新 Run
- `IContextUnitOfWork` - 批量更新協調
- `AppContextService` - 上下文訪問（讀取）
- `IRunContextRepository` - 持久化（寫入）

**評估**: ✅ 職責清晰，分層合理

---

## 💭 分析：Run 是否需要豐富模型？

### 定義："豐富模型"的含義

| 層次         | 特徵                       | 必要性          |
| ------------ | -------------------------- | --------------- |
| **貧血模型** | 只有數據，無行為           | ❌ 不足         |
| **豐富模型** | 數據 + 業務邏輯 + 行為方法 | ✅ **建議**     |
| **服務層**   | 所有邏輯在外層服務         | ⚠️ 可行但易散亂 |

### 當前 Run 的問題

#### 問題 1: IRunContext 是純數據結構

```typescript
// 現狀：純數據
interface IRunContext {
  status: RunStatus
  currentStage: number
  // ... 其他數據
}

// 但沒有方法來詢問：
// - 是否可以進入下一關?
// - 當前是否在戰鬥中?
// - 還有多少進度剩餘?
```

#### 問題 2: 狀態轉移分散

當前進度推進的邏輯分散在：

- `RunInitializationService` - 初始化
- `ShopService` - 購物後進度?
- `PostCombatProcessor` - 戰鬥後進度?
- (其他 Stage 相關服務)

**結果**: 想要追蹤「完整的 Run 生命週期」時需要跳躍多個檔案

#### 問題 3: 狀態驗證不一致

- ❓ 在哪裡驗證"是否可以進入下一關"?
- ❓ 在哪裡驗證"Run 是否已結束"?
- ❓ 這些驗證是否被遺漏?

---

## 🏗️ 建議方案：建立豐富的 Run 模型

### 方案 A: Domain RunAggregate（推薦）

```typescript
// src/domain/run/Run.ts
export class Run {
  private constructor(
    readonly id: string,
    readonly status: RunStatus,
    readonly currentChapter: ChapterLevel,
    readonly currentStage: number,
    readonly remainingFailRetries: number
    // ... 其他字段
  ) {}

  // ===== 查詢方法 =====
  isInProgress(): boolean {
    return this.status === 'IN_PROGRESS'
  }

  canAdvanceToNextStage(): boolean {
    return this.status === 'IN_PROGRESS' && this.currentStage < MAX_STAGES_PER_CHAPTER
  }

  canEnterCombat(): boolean {
    return this.status === 'PENDING_STAGE_START'
  }

  isDefeated(): boolean {
    return this.remainingFailRetries <= 0
  }

  // ===== 狀態轉移方法 =====
  advanceToNextStage(): Run {
    if (!this.canAdvanceToNextStage()) {
      throw new InvalidRunStateError('Cannot advance')
    }
    return new Run(
      this.id,
      this.status,
      this.currentChapter,
      this.currentStage + 1,
      this.remainingFailRetries
      // ...
    )
  }

  markCombatStarted(): Run {
    // 轉變狀態
  }

  markCombatEnded(won: boolean): Run {
    // 轉變狀態
  }

  // ===== 工廠方法 =====
  static create(params: RunCreationParams): Result<Run> {
    // 驗證與創建邏輯
  }
}
```

**優點**:

- ✅ 業務邏輯集中在模型
- ✅ 狀態轉移受保護（不能非法狀態）
- ✅ 易於測試（純方法，無副作用）
- ✅ 自描述性（方法名即業務規則）

**缺點**:

- ⚠️ 需要 Factory 來從 IRunContext 組裝
- ⚠️ 需要 Mapper 來轉回 IRunContext

### 方案 B: Hybrid（目前狀態的改進）

保持 IRunContext 為數據結構，但建立明確的「Run 狀態轉移服務」：

```typescript
// src/application/run/RunStateTransitionService.ts
export class RunStateTransitionService {
  // 所有狀態轉移邏輯集中於此

  advanceToNextStage(context: IRunContext): Result<IRunContext> {
    if (!this.canAdvanceToNextStage(context)) {
      return Err(ErrorCode.InvalidRunState)
    }
    return Ok({ ...context, currentStage: context.currentStage + 1 })
  }

  private canAdvanceToNextStage(context: IRunContext): boolean {
    // 驗證邏輯
  }
}
```

**優點**:

- ✅ 最小化改動
- ✅ 單一責任清晰

**缺點**:

- ❌ 邏輯仍分散
- ❌ 不如 Domain Model 直觀

---

## 🎯 最終建議

### 對於當前開發階段

| 時間點       | 推薦方案                                | 理由                       |
| ------------ | --------------------------------------- | -------------------------- |
| **現在**     | **方案 B (Hybrid)**                     | 快速建立秩序，改進狀態管理 |
| **重構準備** | 遷移到 **方案 A (Domain RunAggregate)** | 代碼穩定後的天然進化       |

### 具體建議清單

#### 短期（立即執行）

```typescript
// 1. 建立 RunStateTransitionService
// 集中管理狀態轉移邏輯
export class RunStateTransitionService {
  advanceToNextStage()
  markDefeat()
  markCombatEnded()
  // ... 其他狀態轉移
}

// 2. 在 IRunContext 上添加查詢方法（不改變結構）
export interface IRunContext {
  // ... 現有字段

  // 新增：查詢方法（通過 helper 函數實現）
  status: RunStatus
}

export function isRunInProgress(ctx: IRunContext): boolean {
  return ctx.status === 'IN_PROGRESS'
}

// 3. 建立清單
// - 所有狀態轉移都經過 RunStateTransitionService
// - 禁止直接修改 IRunContext（除了 Mapper/Factory）
```

#### 中期（代碼穩定後）

```typescript
// 遷移到豐富的 Domain Model
// 建立 Run Aggregate Root
class Run {
  // 包含所有邏輯
}

// 調整架構
App Service → Domain Service (Run) → Repository
```

---

## 🔍 當前架構中的狀態轉移流程

### 尋找進度控制的現況

**關鍵問題**: 目前 Run 狀態變更從何而來？

需要檢查以下檔案：

- `PostCombatProcessor.ts` - 戰鬥後進度?
- `stage-progression/` - 關卡進度管理?
- `ShopService.ts` - 購物後是否影響進度?

**建議**: 建立 `RunLifecycleService` 來統一協調這些流程

---

## 📊 對比總結

| 層面           | 現狀                 | 建議                          |
| -------------- | -------------------- | ----------------------------- |
| **Run 的認知** | 是持久化數據結構     | 應視為 Domain Aggregate       |
| **狀態驗證**   | 分散在各服務         | 集中在轉移服務或 Domain Model |
| **業務規則**   | 隱含在服務邏輯中     | 顯式在模型或轉移服務中        |
| **測試成本**   | 高（需整合多個服務） | 低（隔離的模型/服務）         |

---

## 💡 最終答案

### Q1: Run 是否該有豐富模型？

**A**: ✅ **是的，強烈建議**

- 原因：避免狀態管理分散，提高業務規則的清晰度

### Q2: 現在就做還是之後重構？

**A**: **兩階段策略**

1. **即刻**: 建立 `RunStateTransitionService` 集中邏輯（方案 B）
2. **穩定後**: 升級為 `Run Domain Model`（方案 A）

### Q3: 應該用 Domain Service 還是 Application Service？

**A**: **兩者結合**

- Domain: `Run` Aggregate 含邏輯與驗證
- Application: `RunLifecycleService` 協調 Run、Shop、Combat 等跨領域操作

### Q4: 狀態改變、進度推進、過下一關等控制的來源？

**A**: **統一由 Application Service 控制**

```
API Layer (外部請求)
    ↓
RunLifecycleService (協調器，決定狀態轉移)
    ↓
RunStateTransitionService (執行狀態轉移，驗證規則)
    ↓
Run Domain Model (保持不變性)
    ↓
Repository (持久化)
```

這樣可以確保所有「改變發生的點」都是可追蹤的，而不是分散在十多個地方。
