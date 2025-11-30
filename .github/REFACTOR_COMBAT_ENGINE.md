# CombatEngine 設計分析與重構方案

## 核心問題分析

### 問題本質：職責過多 + 數據模型複雜

**當前 CombatEngine 的職責：**

1. 系統初始化與生命週期管理
2. 戰鬥流程控制
3. 結果判定邏輯
4. 快照生成
5. 統計數據計算
6. 結果彙總與構建
7. 關鍵時刻記錄

**問題根源：**

- **God Object**：241 行，做太多事
- **結果模型過於複雜**：`CombatResult` 包含 10+ 個字段
- **統計計算邏輯混亂**：`calculateStatistics()` 是空殼（TODO）
- **快照生成邏輯硬編碼**：無法自定義快照內容
- **關鍵時刻記錄未實現**：都是 TODO
- **難以擴展**：要加新統計項需改多處

---

## 設計缺陷詳解

### 1️⃣ 結果構建過於複雜

**現狀：**

```typescript
private buildCombatResult(): CombatResult {
  const { outcome, winner } = this.determineOutcome()
  const survivors = this.getSurvivors()
  const totalTicks = this.context.getCurrentTick()
  const logs = this.eventLogger.getLogs()
  const snapshots: CombatSnapshot[] = []
  // 生成快照 (每 snapshotInterval 個 Tick)
  for (let tick = 0; tick <= totalTicks; tick += interval) {
    snapshots.push(this.createSnapshot(tick))
  }
  const statistics = this.calculateStatistics()
  const keyMoments: KeyMoment[] = [...]
  return { outcome, winner, survivors, totalTicks, logs, snapshots, keyMoments, statistics, startedAt, endedAt }
}
```

**問題：**

- 一個方法做 7 件事：判定結果、獲取存活者、生成快照、計算統計、收集日誌、構建時刻、組裝返回值
- 每個部分都可能失敗，但無錯誤處理
- 無法單獨測試每個邏輯
- 快照生成邏輯硬編碼（`for` 循環）

---

### 2️⃣ 統計計算空殼化

**現狀：**

```typescript
private calculateStatistics(): CombatStatistics {
  const characterStats = new Map<CharacterId, CharacterStats>()
  allCharacters.forEach(char => {
    characterStats.set(char.id, {
      characterId: char.id,
      damageDealt: 0,  // TODO: 從事件日誌統計
      damageTaken: 0,  // TODO
      kills: 0,        // TODO
      // ...
    })
  })
  // TODO: 從事件日誌中統計數據
  return { characterStats, effectsApplied: new Map(), totalDamage, duration }
}
```

**問題：**

- 所有統計數據都是 0 或空
- 沒有真正從 `eventLogger` 讀取數據
- 無法統計傷害、擊殺、閃避等
- `effectsApplied` 永遠是空 Map

---

### 3️⃣ 快照生成時機固定

**現狀：**

```typescript
for (let tick = 0; tick <= totalTicks; tick += interval) {
  snapshots.push(this.createSnapshot(tick))
}
```

**問題：**

- 只能按固定間隔生成快照
- 無法在「關鍵時刻」生成快照（如角色死亡、暴擊）
- 快照內容固定，無法自定義
- 事後生成快照無法獲取真實戰鬥時的狀態

---

### 4️⃣ 關鍵時刻記錄未實現

**現狀：**

```typescript
private recordKeyMoment(type, description, characterIds): void {
  // TODO: 實作關鍵時刻記錄
  void type
  void description
  void characterIds
}
```

**問題：**

- 完全沒實現
- 調用了但什麼都不做
- 最終只有 `battle-start` 和 `battle-end` 兩個硬編碼時刻

---

### 5️⃣ 模型檔案過多且分散

**現狀：**

```
models/
├── combat.config.model.ts    (20 行)
├── combat.result.model.ts    (100+ 行，包含 6 個 interface)
```

**問題：**

- `combat.result.model.ts` 包含太多介面
- 應該拆分為獨立的職責模型
- 混合了「結果」、「統計」、「快照」、「時刻」等多種概念

---

## 設計模式方案

### 推薦架構：**責任分離 + 策略模式 + 建造者模式**

```
CombatEngine（精簡協調者，~80 行）
├── ResultBuilder（結果構建器）
│   ├── OutcomeAnalyzer（結果判定）
│   ├── SnapshotCollector（快照收集）
│   └── StatisticsCalculator（統計計算）
├── KeyMomentDetector（關鍵時刻偵測）
│   ├── FirstBloodDetector
│   ├── CriticalHitDetector
│   └── DeathDetector
└── models/（重組）
    ├── CombatConfig.ts
    ├── CombatOutcome.ts
    ├── CombatStatistics.ts
    ├── CombatSnapshot.ts
    ├── KeyMoment.ts
    └── CombatResult.ts
```

---

## 詳細重構方案

### Phase 1：拆分結果構建器

**新建 `ResultBuilder`：**

```typescript
// src/modules/combat/combat-engine/builders/ResultBuilder.ts
export class ResultBuilder {
  constructor(
    private context: CombatContext,
    private config: CombatConfig,
    private eventLogger: EventLogger,
  ) {}

  build(): CombatResult {
    const outcome = this.analyzeOutcome()
    const statistics = this.calculateStatistics()
    const snapshots = this.collectSnapshots()
    const keyMoments = this.collectKeyMoments()

    return {
      outcome: outcome.outcome,
      winner: outcome.winner,
      survivors: this.getSurvivors(),
      totalTicks: this.context.getCurrentTick(),
      logs: this.eventLogger.getLogs(),
      snapshots,
      keyMoments,
      statistics,
      startedAt: this.startTime,
      endedAt: Date.now(),
    }
  }

  private analyzeOutcome(): { outcome: CombatOutcome; winner: ... } {
    // 獨立的結果判定邏輯
  }

  private calculateStatistics(): CombatStatistics {
    // 真正從 eventLogger 統計數據
  }

  private collectSnapshots(): CombatSnapshot[] {
    // 收集快照
  }

  private collectKeyMoments(): KeyMoment[] {
    // 收集關鍵時刻
  }

  private getSurvivors(): ICharacter[] {
    return [...this.config.playerTeam, ...this.config.enemyTeam].filter(c => !c.isDead)
  }
}
```

**優勢：**
✅ 單一職責：專注於構建結果  
✅ 易於測試：每個方法獨立測試  
✅ 可擴展：新增統計項只需修改這個類

---

### Phase 2：實現統計計算器

**新建 `StatisticsCalculator`：**

```typescript
// src/modules/combat/combat-engine/calculators/StatisticsCalculator.ts
export class StatisticsCalculator {
  constructor(private eventLogger: EventLogger) {}

  calculate(characters: ICharacter[]): CombatStatistics {
    const characterStats = this.initializeStats(characters)

    // 遍歷事件日誌，累積統計
    this.eventLogger.getLogs().forEach(log => {
      this.processLogEntry(log, characterStats)
    })

    return {
      characterStats,
      effectsApplied: this.countEffects(),
      totalDamage: this.sumTotalDamage(characterStats),
      duration: this.context.getCurrentTick(),
    }
  }

  private processLogEntry(log: CombatLogEntry, stats: Map<...>): void {
    switch (log.eventName) {
      case 'entity:damage':
        this.recordDamage(log, stats)
        break
      case 'entity:death':
        this.recordKill(log, stats)
        break
      case 'entity:critical':
        this.recordCritical(log, stats)
        break
      case 'combat:miss':
        this.recordDodge(log, stats)
        break
    }
  }

  private recordDamage(log: CombatLogEntry, stats: Map<...>): void {
    const { targetId, sourceId, amount } = log.payload
    // 更新 damageTaken
    const targetStats = stats.get(targetId)
    if (targetStats) targetStats.damageTaken += amount
    // 更新 damageDealt
    const sourceStats = stats.get(sourceId)
    if (sourceStats) sourceStats.damageDealt += amount
  }

  // ... 其他統計方法
}
```

**優勢：**
✅ 真正實現統計邏輯，不再是 TODO  
✅ 從事件日誌反推統計，保證數據一致性  
✅ 可擴展：新增統計項只需添加 `processLogEntry` 的 case

---

### Phase 3：關鍵時刻偵測器

**新建 `KeyMomentDetector`：**

```typescript
// src/modules/combat/combat-engine/detectors/KeyMomentDetector.ts
export class KeyMomentDetector {
  private moments: KeyMoment[] = []

  constructor(private eventBus: EventBus) {
    this.registerDetectors()
  }

  private registerDetectors(): void {
    // 監聽第一滴血
    this.eventBus.on('entity:damage', (payload) => {
      if (this.moments.length === 0) {
        this.moments.push({
          tick: payload.tick,
          type: 'first-blood',
          description: `${payload.sourceId} 造成第一滴血`,
          characterIds: [payload.sourceId, payload.targetId],
        })
      }
    })

    // 監聽角色死亡
    this.eventBus.on('entity:death', (payload) => {
      this.moments.push({
        tick: payload.tick,
        type: 'character-death',
        description: `${payload.targetId} 陣亡`,
        characterIds: [payload.targetId],
      })
    })

    // 監聽暴擊
    this.eventBus.on('entity:critical', (payload) => {
      this.moments.push({
        tick: payload.tick,
        type: 'critical-hit',
        description: `${payload.sourceId} 暴擊 ${payload.multiplier}x`,
        characterIds: [payload.sourceId, payload.targetId],
      })
    })
  }

  getKeyMoments(): KeyMoment[] {
    return this.moments
  }
}
```

**優勢：**
✅ 自動收集關鍵時刻，無需手動調用  
✅ 基於事件驅動，實時記錄  
✅ 易於擴展：新增偵測器只需添加新的事件監聽

---

### Phase 4：快照收集策略化

**新建快照收集介面：**

```typescript
// src/modules/combat/combat-engine/strategies/ISnapshotStrategy.ts
export interface ISnapshotStrategy {
  shouldTakeSnapshot(tick: number): boolean
}

// 固定間隔策略
export class IntervalSnapshotStrategy implements ISnapshotStrategy {
  constructor(private interval: number) {}
  shouldTakeSnapshot(tick: number): boolean {
    return tick % this.interval === 0
  }
}

// 關鍵時刻策略
export class KeyMomentSnapshotStrategy implements ISnapshotStrategy {
  constructor(private keyMoments: KeyMoment[]) {}
  shouldTakeSnapshot(tick: number): boolean {
    return this.keyMoments.some((m) => m.tick === tick)
  }
}

// 組合策略
export class CompositeSnapshotStrategy implements ISnapshotStrategy {
  constructor(private strategies: ISnapshotStrategy[]) {}
  shouldTakeSnapshot(tick: number): boolean {
    return this.strategies.some((s) => s.shouldTakeSnapshot(tick))
  }
}
```

**優勢：**
✅ 可配置快照策略  
✅ 支援多種策略組合  
✅ 可在關鍵時刻自動快照

---

### Phase 5：重組模型文件

**拆分 `combat.result.model.ts`：**

```
models/
├── config/
│   └── CombatConfig.ts       (配置)
├── result/
│   ├── CombatOutcome.ts      (結果類型)
│   ├── CombatResult.ts       (主結果)
│   ├── CombatStatistics.ts   (統計)
│   ├── CombatSnapshot.ts     (快照)
│   └── KeyMoment.ts          (關鍵時刻)
└── index.ts                   (統一匯出)
```

**優勢：**
✅ 每個檔案職責單一  
✅ 易於查找和維護  
✅ 避免單個檔案過大

---

### Phase 6：精簡後的 CombatEngine

**重構後的 CombatEngine：**

```typescript
export class CombatEngine {
  private context: CombatContext
  private ticker: TickerDriver
  private systems: CombatSystem[] // 統一管理所有系統
  private keyMomentDetector: KeyMomentDetector
  private resultBuilder: ResultBuilder
  private config: CombatConfig

  constructor(config: CombatConfig) {
    this.config = this.mergeDefaultConfig(config)
    this.context = new CombatContext(this.config.seed)

    // 初始化子系統
    this.systems = [
      new TickerProcessor(this.context),
      new AbilitySystem(this.context),
      new EventLogger(this.context.eventBus),
    ]

    this.ticker = new TickerDriver(this.context, this.config.maxTicks, this.config.snapshotInterval)
    this.ticker.setStopCondition(() => this.isGameOver())

    this.keyMomentDetector = new KeyMomentDetector(this.context.eventBus)
    this.resultBuilder = new ResultBuilder(this.context, this.config, this.eventLogger)

    this.setupCharacters()
  }

  public start(): CombatResult {
    this.ticker.start()
    return this.resultBuilder.build()
  }

  public dispose(): void {
    this.ticker.stop()
    this.systems.forEach((system) => system.dispose())
  }

  private isGameOver(): boolean {
    const playerAlive = this.config.playerTeam.some((c) => !c.isDead)
    const enemyAlive = this.config.enemyTeam.some((c) => !c.isDead)
    return !playerAlive || !enemyAlive
  }

  private setupCharacters(): void {
    ;[...this.config.playerTeam, ...this.config.enemyTeam].forEach((char) => {
      this.context.addEntity(char)
    })
  }

  private mergeDefaultConfig(config: CombatConfig): CombatConfig {
    return { maxTicks: 10000, snapshotInterval: 100, enableLogging: true, ...config }
  }
}
```

**行數對比：**

- 重構前：241 行
- 重構後：~80 行
- 減少：67%

---

## 實施路線圖

### 優先級順序：

| 優先級 | 任務                        | 複雜度 | 收益     | 依賴 |
| ------ | --------------------------- | ------ | -------- | ---- |
| 1      | 拆分模型文件                | ⭐     | 🌟🌟     | 無   |
| 2      | 實現 `StatisticsCalculator` | ⭐⭐   | 🌟🌟🌟   | 無   |
| 3      | 實現 `KeyMomentDetector`    | ⭐⭐   | 🌟🌟🌟   | 無   |
| 4      | 建立 `ResultBuilder`        | ⭐⭐   | 🌟🌟🌟🌟 | 2, 3 |
| 5      | 重構 `CombatEngine`         | ⭐⭐   | 🌟🌟🌟🌟 | 4    |
| 6      | 實現快照策略（可選）        | ⭐     | 🌟🌟     | 無   |

**預期結果：**

- ✅ CombatEngine 從 241 行降至 ~80 行
- ✅ 統計數據真正實現，不再是 TODO
- ✅ 關鍵時刻自動記錄
- ✅ 每個組件獨立可測試
- ✅ 模型文件清晰分離

---

## 設計模式總結

| 模式           | 用於                      | 好處                   |
| -------------- | ------------------------- | ---------------------- |
| **建造者模式** | `ResultBuilder`           | 分步構建複雜的結果對象 |
| **策略模式**   | `ISnapshotStrategy`       | 可插拔的快照策略       |
| **觀察者模式** | `KeyMomentDetector`       | 自動監聽並記錄關鍵時刻 |
| **組合模式**   | `systems: CombatSystem[]` | 統一管理多個子系統     |
| **單一職責**   | 各個 Calculator/Detector  | 每個類只做一件事       |

---

## 關鍵改進清單

- [ ] 拆分 `combat.result.model.ts` 為多個獨立文件
- [ ] 建立 `StatisticsCalculator` 並實現真正的統計邏輯
- [ ] 建立 `KeyMomentDetector` 並自動記錄關鍵時刻
- [ ] 建立 `ResultBuilder` 統一管理結果構建
- [ ] 重構 `CombatEngine` 使用新組件
- [ ] 移除所有 TODO 註解
- [ ] 為每個新組件編寫單元測試
- [ ] 驗證統計數據正確性
- [ ] 文檔更新

---

## 額外建議：統一系統介面

**問題：**
當前各系統（TickerProcessor, AbilitySystem, EventLogger）沒有統一介面

**建議：**

```typescript
// src/modules/combat/shared/interfaces/CombatSystem.interface.ts
export interface ICombatSystem {
  dispose(): void
  getName(): string  // 用於調試
}

// 各系統實現此介面
export class TickerProcessor implements ICombatSystem {
  getName() { return 'TickerProcessor' }
  dispose() { ... }
}
```

**好處：**
✅ CombatEngine 可統一管理所有系統  
✅ 易於添加新系統  
✅ 統一的生命週期管理
