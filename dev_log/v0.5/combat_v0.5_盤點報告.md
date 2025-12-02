# Combat v0.5 盤點報告

## 版本資訊

- **版本號**: v0.5
- **完成日期**: 2025-12-02
- **涵蓋範圍**: Combat 核心引擎 + Combat-Impl 實作層

---

## 一、執行摘要（給非技術人員）

### 這個版本能做什麼？

Combat v0.5 是一個**完整可運行的戰鬥模擬引擎**，目前已經可以：

1. **模擬完整的角色對戰**
   - 支援多角色隊伍（玩家 vs 敵人）
   - 自動進行回合制戰鬥直到一方全滅
   - 產生詳細的戰鬥記錄與快照

2. **豐富的角色養成系統**
   - 角色有 12+ 種屬性（生命、護甲、閃避、攻擊力、暴擊率等）
   - 可裝備武器、防具、飾品
   - 可攜帶多個遺物（stackable relics）增強能力
   - 每個角色有專屬大絕招（Ultimate）

3. **戰鬥策略深度**
   - 攻擊有命中判定（準確度 vs 閃避）
   - 暴擊系統（機率與倍率）
   - 護甲減傷機制
   - 能量累積系統（攻擊累積能量，滿 100 釋放大招）

4. **效果與狀態系統**
   - 毒素效果（持續傷害、可堆疊、自然衰減）
   - 充能狀態（提升暴擊率）
   - 血契效果（犧牲生命換取傷害加成）
   - 護甲強化（低血量時觸發）

### 實際應用範例

假設你想模擬一場戰鬥：

**玩家隊伍**:

- 戰士：裝備「守護者板甲」（低血量時護甲提升）+ 「血契」大招（犧牲生命強化 3 次攻擊）
- 弓箭手：裝備「風暴之刃」（充能時暴擊率翻倍）+ 「毒藥瓶」遺物 x2（攻擊附加雙層毒素）+ 「雷霆一擊」大招（範圍傷害）

**敵方隊伍**:

- 哥布林 x2：基礎屬性，無特殊裝備

**戰鬥過程**:

1. 戰鬥自動進行，每個 tick（0.01 秒）系統會：
   - 檢查冷卻時間，決定誰能攻擊
   - 計算命中判定（準確度 vs 閃避）
   - 計算暴擊判定（風暴之刃的充能效果）
   - 計算傷害（血契加成、護甲減免）
   - 應用毒素效果（每 tick 持續傷害）
   - 累積能量（攻擊時獲得能量）
   - 釋放大招（能量滿 100 時）

2. 戰鬥結束條件：
   - 一方全滅
   - 或達到最大回合數（預設 10000 ticks）

3. 輸出結果：
   - 勝利方
   - 存活者名單與剩餘血量
   - 完整戰鬥日誌（每次攻擊、傷害、大招、死亡）
   - 快照序列（每 100 ticks 記錄一次所有角色狀態）
   - 統計數據（總傷害、暴擊次數、大招使用次數等）

### 目前限制

1. **僅支援戰鬥邏輯**：不包含 UI 介面、關卡系統、商店系統
2. **戰鬥無法干預**：戰鬥開始後自動執行，玩家無法中途操作
3. **無存檔功能**：戰鬥結果僅存在記憶體中
4. **效果種類有限**：目前僅實作 3-4 種效果作為範例

---

## 二、技術架構報告（給開發人員）

### 2.1 系統分層架構

```
combat/
├── infra/           【基礎設施層】最底層，提供通用工具
│   ├── config/      - 常數定義（屬性、公式、預設值）
│   ├── event-bus/   - 事件總線（發布/訂閱）
│   ├── resource-registry/  - 資源註冊表（效果、裝備、角色查找）
│   └── shared/      - 共用工具（RNG、ID 生成、型別守衛）
│
├── domain/          【領域層】核心業務實體
│   ├── character/   - 角色實體（屬性、管理器）
│   ├── effect/      - 效果管理器
│   ├── item/        - 裝備與遺物管理器
│   └── ultimate/    - 大招管理器
│
├── logic/           【邏輯層】獨立業務邏輯
│   ├── damage/      - 傷害計算鏈（8 階段步驟模式）
│   ├── logger/      - 事件記錄器
│   ├── snapshot/    - 快照收集器
│   └── tick/        - Tick 驅動器
│
├── coordination/    【協調層】跨模組協作
│   ├── tick.action.system.ts  - 攻擊協調系統
│   ├── attack.executor.ts     - 攻擊執行器
│   ├── energy.manager.ts      - 能量管理器
│   ├── cooldown.manager.ts    - 冷卻管理器
│   └── effect.processor.ts    - 效果處理器
│
├── context/         【上下文層】全域狀態管理
│   └── combat.context.ts  - 戰鬥上下文（EventBus、RNG、實體集合）
│
└── combat-engine/   【引擎層】最高層，編排所有系統
    └── combat.engine.ts  - 戰鬥引擎（生命週期管理）
```

**依賴規則**: 下層不依賴上層，箭頭向下

- `combat-engine` → 所有層
- `coordination` → `domain`, `logic`, `context`, `infra`
- `logic` → `domain`, `context`, `infra`
- `domain` → `infra`
- `infra` → 無外部依賴

### 2.2 核心子系統設計

#### A. 戰鬥引擎 (CombatEngine)

**職責**: 頂層編排者，負責初始化、啟動、結束戰鬥

**工作流程**:

```typescript
1. new CombatEngine(config)
   → 建立 ResourceRegistry
   → 建立 CombatContext（EventBus, RNG）
   → 初始化子系統（Ticker, TickActionSystem, Logger, SnapshotCollector）
   → 註冊角色到 Context

2. engine.start()
   → 啟動 Ticker（開始 tick 循環）
   → 戰鬥自動執行直到停止條件
   → 收集日誌與快照
   → 建構 CombatResult（勝負、統計、倖存者）

3. engine.dispose()
   → 清理所有訂閱與資源
```

**關鍵特性**:

- 單一入口點，簡化外部調用
- 使用 Builder 模式產生結果
- 自動分析戰鬥結果（勝負、統計）

---

#### B. 角色系統 (Character)

**職責**: 戰鬥實體，封裝屬性、裝備、效果、大招

**內部結構**:

```typescript
Character
├── AttributeContainer    - 儲存基礎屬性 + Modifiers
├── AttributeCalculator   - 計算最終屬性（加算 → 乘算）
├── EffectManager         - 管理附加效果
├── EquipmentManager      - 管理裝備槽（weapon, armor, accessory）
├── RelicManager          - 管理遺物（可堆疊）
└── UltimateManager       - 管理大絕招
```

**屬性計算流程**:

```
Base Value (基礎值)
  ↓
+ Additive Modifiers (加算修正，如 +10 攻擊)
  ↓
× Multiplicative Modifiers (乘算修正，如 ×1.2 攻擊)
  ↓
Final Value (最終值)
```

**設計優點**:

- **單一職責**: 每個 Manager 只處理一件事
- **依賴注入**: 透過 Registry 查找資源，避免直接持有
- **可擴展**: 新增裝備/效果只需實作介面

---

#### C. 傷害計算鏈 (DamageChain)

**職責**: 將複雜的傷害計算拆成 8 個有序階段，支援 Hook 擴展

**執行流程**:

```typescript
DamageEvent (初始傷害事件)
  ↓
[Stage 1] BeforeDamageStep       - 觸發 beforeDamageCalculation hooks
  ↓
[Stage 2] HitCheckStep           - 命中判定（準確度 vs 閃避）
  ↓
[Stage 3] CriticalStep           - 暴擊判定（暴擊率 vs RNG）
  ↓
[Stage 4] DamageModifyStep       - 傷害修正（血契加成、裝備加成）
  ↓
[Stage 5] DefenseCalculationStep - 防禦計算（護甲減免）
  ↓
[Stage 6] BeforeApplyStep        - 應用前最後確認
  ↓
[Stage 7] ApplyDamageStep        - 扣血、檢查死亡
  ↓
[Stage 8] AfterApplyStep         - 觸發 afterDamageApply hooks
```

**Hook 機制**:

- 每個 Effect/Equipment 可實作 `ICombatHook` 介面
- 在特定階段插入自訂邏輯
- 範例：
  - `ChargedCriticalEffect` 在 Stage 3 修改暴擊率
  - `BloodPactEffect` 在 Stage 4 修改傷害倍率
  - `GuardianPlateEffect` 在 Stage 5 修改護甲值

**設計優點**:

- **開放封閉原則**: 新增效果無需修改核心邏輯
- **責任鏈模式**: 每個 Step 可終止流程（如 Miss 後直接跳出）
- **可測試性**: 每個 Step 獨立，易於單元測試

---

#### D. 效果系統 (Effect System)

**職責**: 管理角色身上的增益/減益效果

**生命週期**:

```typescript
1. onApply(characterId, context)   - 效果被施加時（初始化）
2. onTick(characterId, context)    - 每個 tick 觸發（可選）
3. onRemove(characterId, context)  - 效果被移除時（清理）
```

**Hook 介面**:

```typescript
interface ICombatHook {
  beforeDamageCalculation?(event, context): DamageEvent
  onHitCheck?(event, context): DamageEvent
  onCritCheck?(event, context): DamageEvent
  onDamageModify?(event, context): DamageEvent
  onDefenseCalculation?(event, context): DamageEvent
  beforeDamageApply?(event, context): DamageEvent
  afterDamageApply?(event, context): void
}
```

**實作範例**:

- `PoisonEffect`: 每 tick 造成真實傷害，每秒衰減 10% 層數
- `BloodPactEffect`: 修改傷害倍率，3 次攻擊後自動移除
- `ChargedCriticalEffect`: 檢測充能狀態，修改暴擊率

**設計優點**:

- **事件驅動**: 效果被動響應，不主動輪詢
- **統一管理**: 透過 EffectManager 集中處理
- **資源追蹤**: 透過 Registry 全域查找

---

#### E. 裝備與遺物系統

**裝備 (Equipment)**:

- 獨佔式（每個槽位只能裝一件）
- 槽位類型：`weapon`, `armor`, `accessory`
- 裝備時自動應用內建效果
- 卸下時自動移除效果

**遺物 (Relic)**:

- 可堆疊（同一個遺物可持有多個）
- 每次堆疊會重新初始化效果
- 範例：`PoisonVial` 兩層 = 攻擊時施加兩次毒素

**實作範例**:

```typescript
// Stormblade: 充能時暴擊率翻倍
class Stormblade extends Equipment {
  constructor() {
    super({ name: 'Stormblade', rarity: 'epic' })
  }
  protected initializeEffects(): void {
    this.effects.push(new ChargedCriticalEffect())
  }
}

// PoisonVial: 可堆疊毒素
class PoisonVial extends Relic {
  protected initializeEffects(): void {
    for (let i = 0; i < this.getStackCount(); i++) {
      this.effects.push(new PoisonEffect(1))
    }
  }
}
```

---

#### F. 大招系統 (Ultimate)

**能量機制**:

- 角色有能量條（0-100）
- 每次攻擊獲得能量（由 `energyGainOnAttack` 屬性決定）
- 能量滿 100 時自動釋放大招

**大招類型**:

1. **傷害型** (`ThunderStrikeUltimate`): 造成倍率傷害
2. **增益型** (`BloodPactUltimate`): 施加自身效果

**實作範例**:

```typescript
class BloodPactUltimate implements IUltimateAbility {
  execute(casterId: string, context: ICombatContext): void {
    const caster = context.getCharacter(casterId)
    // 1. 扣除 20% 生命
    const maxHp = caster.getAttribute('maxHp')
    const sacrifice = maxHp * 0.2
    caster.setCurrentHpClamped(currentHp - sacrifice)

    // 2. 施加 Blood Pact 效果（3 次攻擊 2 倍傷害）
    caster.addEffect(new BloodPactEffect(2.0, 3), context)
  }
}
```

---

#### G. 資源註冊表 (ResourceRegistry)

**職責**: 集中管理所有戰鬥內資源的查找與追蹤

**管理資源**:

- Characters（角色）
- Effects（效果）
- Equipment（裝備）
- Relics（遺物）
- Ultimates（大招）

**為何需要 Registry？**

1. **避免循環依賴**: Effect 不直接持有 Character 引用，而是透過 ID 查找
2. **集中追蹤**: 所有效果都在 Registry 註冊，便於除錯與清理
3. **效能優化**: O(1) Map 查找

**實作**:

```typescript
class InMemoryResourceRegistry implements IResourceRegistry {
  private characters = new Map<string, ICharacter>()
  private effects = new Map<string, IEffect>()
  // ...

  registerEffect(effect: IEffect): void {
    this.effects.set(effect.id, effect)
  }

  getEffect(id: string): IEffect | undefined {
    return this.effects.get(id)
  }
}
```

---

#### H. 事件總線 (EventBus)

**職責**: 解耦系統間通訊，採用發布/訂閱模式

**支援事件**:

- `combat:start` / `combat:end`
- `tick:start` / `tick:end`
- `entity:attack` / `entity:damage` / `entity:death`
- `ultimate:cast`

**使用範例**:

```typescript
// 訂閱事件
context.eventBus.on('entity:death', (payload) => {
  console.log(`${payload.targetId} 死亡`)
})

// 發布事件
context.eventBus.emit('entity:death', { targetId: 'Goblin1' })
```

**設計優點**:

- **鬆耦合**: 系統之間不直接調用
- **可擴展**: 新增監聽器不影響既有系統
- **記錄友善**: Logger 透過監聽事件自動記錄

---

### 2.3 Combat-Impl 實作層

**目錄結構**:

```
combat-impl/
├── effects/          - 具體效果實作
│   ├── Equipment/    - 裝備效果（ChargedCriticalEffect）
│   └── NativeStatus/ - 狀態效果（PoisonEffect）
├── equipment/        - 裝備定義（Stormblade, GuardiansPlate）
├── relics/           - 遺物定義（PoisonVial）
├── ultimates/        - 大招定義（ThunderStrike, BloodPact）
└── examples/         - 使用範例（simpleCombat.ts）
```

**已實作內容**:

| 類型 | 名稱                  | 功能                   |
| ---- | --------------------- | ---------------------- |
| 裝備 | Stormblade            | 充能時暴擊率翻倍       |
| 裝備 | Guardian's Plate      | 低血量時護甲提升       |
| 遺物 | Poison Vial           | 攻擊附加毒素（可堆疊） |
| 大招 | Thunder Strike        | 範圍傷害（當前為單體） |
| 大招 | Blood Pact            | 犧牲生命強化攻擊       |
| 效果 | PoisonEffect          | 持續傷害 + 衰減        |
| 效果 | BloodPactEffect       | 傷害加成 + 計數器      |
| 效果 | ChargedCriticalEffect | 暴擊率修正             |

---

## 三、架構優勢分析

### 3.1 設計模式應用

| 模式           | 應用位置                        | 優勢                     |
| -------------- | ------------------------------- | ------------------------ |
| **責任鏈模式** | DamageChain                     | 可擴展、可中斷、邏輯清晰 |
| **策略模式**   | TargetSelector                  | 靈活切換目標選擇邏輯     |
| **觀察者模式** | EventBus                        | 解耦系統、易於擴展       |
| **建造者模式** | ResultBuilder                   | 複雜物件建構清晰         |
| **工廠模式**   | DamageFactory                   | 統一建立 DamageEvent     |
| **管理者模式** | EffectManager, EquipmentManager | 職責分離、高內聚         |
| **註冊表模式** | ResourceRegistry                | 集中管理、避免循環依賴   |

### 3.2 SOLID 原則遵循

**S - 單一職責原則 (SRP)**

- ✅ 每個 Manager 只處理一種資源
- ✅ 每個 Step 只處理一個階段
- ✅ Logger 只負責記錄，Snapshot 只負責快照

**O - 開放封閉原則 (OCP)**

- ✅ DamageChain 透過 Hook 擴展，無需修改核心
- ✅ 新增效果/裝備只需實作介面

**L - 里氏替換原則 (LSP)**

- ✅ ITargetSelector 所有實作可互換
- ✅ IEffect 所有實作可互換

**I - 介面隔離原則 (ISP)**

- ✅ ICombatHook 所有方法都是 optional
- ✅ IUltimateAbility 只定義必要方法

**D - 依賴倒置原則 (DIP)**

- ✅ 高層模組依賴抽象（IResourceRegistry, ICombatContext）
- ⚠️ **未完全實踐**（詳見下方問題分析）

### 3.3 技術亮點

1. **Type-Safe Event System**
   - 使用 TypeScript 的 Mapped Types 保證事件類型安全
   - `EventMap` + `EventPayloads` 避免錯誤的 payload

2. **資源 ID 管理**
   - 使用 nanoid 產生唯一 ID
   - 簡化查找邏輯（字串 ID vs 物件引用）

3. **屬性計算分離**
   - AttributeContainer（資料）與 AttributeCalculator（邏輯）分離
   - 支援 Modifier 優先順序與加/乘算

4. **Hook 系統彈性**
   - Effect 同時實作 IEffect 與 ICombatHook
   - 在傷害鏈任意階段插入邏輯

---

## 四、架構缺陷與改進建議（資深架構師視角）

### 4.1 嚴重問題

#### 🔴 問題 1: 依賴倒置原則未徹底實踐

**現況**:

```typescript
// IEffect 介面定義在 domain 層，卻依賴 context 層的具體型別
import type { ICombatContext } from '@/modules/combat/context'

interface IEffect {
  onApply(characterId: string, context: ICombatContext): void
  onTick?(characterId: string, context: ICombatContext): void
}
```

**問題**:

- Domain 層（高層）依賴 Context 層（低層）的具體介面
- 違反「依賴箭頭向下」原則
- 若遷移到 C#/Java，會形成專案循環依賴

**解決方案**:

```typescript
// 將 ICombatContext 移至 domain/shared/interfaces/
// Domain 定義契約，Context 層實作契約
domain/shared/interfaces/combat-context.interface.ts
  ↑ (定義)
context/combat.context.ts (實作)
```

**參考文檔**: `dev_log/v0.5/循環.md` 已詳細說明

---

#### 🔴 問題 2: CombatContext 作為 God Object

**現況**:

```typescript
class CombatContext {
  readonly eventBus: EventBus
  readonly rng: CombatRandomGenerator
  readonly registry: IResourceRegistry

  getEntity(), addEntity(), removeEntity()
  getCurrentTick(), incrementTick(), resetTick()
  // 所有系統都依賴這個巨型物件
}
```

**問題**:

- 違反單一職責原則（管理實體 + Tick + 提供工具）
- 未來擴展會越來越臃腫
- 難以單元測試（Mock 成本高）

**建議重構**:

```typescript
// 拆分為多個專注的 Context
interface IEntityRepository {
  getEntity(id: string): IEntity | undefined
  addEntity(entity: IEntity): void
  // ...
}

interface ITickProvider {
  getCurrentTick(): number
  incrementTick(): void
}

interface ICombatInfrastructure {
  readonly eventBus: EventBus
  readonly rng: CombatRandomGenerator
}

// CombatContext 組合這些介面
class CombatContext {
  readonly entities: IEntityRepository
  readonly tick: ITickProvider
  readonly infra: ICombatInfrastructure
  readonly registry: IResourceRegistry
}
```

---

#### 🔴 問題 3: Effect 介面的雙重職責

**現況**:

```typescript
// IEffect 同時是資料與行為
interface IEffect {
  readonly id: string
  readonly name: string
  onApply(...)
  onTick(...)
  onRemove(...)
}

// 實作時又實作 ICombatHook
class BloodPactEffect implements IEffect, ICombatHook {
  // ...
}
```

**問題**:

- Effect（資料）與 Hook（行為）混合
- 違反單一職責原則
- 未來若要分離「效果顯示」與「效果邏輯」會很痛苦

**建議設計**:

```typescript
// 資料與行為分離
interface IEffectData {
  readonly id: string
  readonly name: string
  readonly duration?: number
  readonly stacks?: number
}

interface IEffectBehavior {
  onApply(effect: IEffectData, target: ICharacter, context): void
  onTick?(effect: IEffectData, target: ICharacter, context): void
  onRemove?(effect: IEffectData, target: ICharacter, context): void
}

// Effect 持有資料，Behavior 處理邏輯
class Effect {
  constructor(
    private data: IEffectData,
    private behavior: IEffectBehavior
  ) {}
}
```

---

### 4.2 中等問題

#### 🟡 問題 4: 時間管理耦合瀏覽器 API

**現況**:

```typescript
// PoisonEffect.ts
const ticksPassed = currentTick - this.lastDecayTick
const secondsPassed = ticksPassed / 100 // 假設 100 ticks = 1 秒
```

**問題**:

- 硬編碼時間轉換（100 ticks/秒）
- 若要支援變速回放或不同幀率，需大量修改
- 不符合「時間抽象」原則

**建議**:

```typescript
// 引入 TimeProvider
interface ITimeProvider {
  ticksToSeconds(ticks: number): number
  secondsToTicks(seconds: number): number
  readonly tickRate: number // ticks per second
}

// 在 CombatConfig 中配置
class CombatConfig {
  readonly tickRate: number = 100 // 可調整
}

// Effect 使用
const secondsPassed = context.time.ticksToSeconds(ticksPassed)
```

---

#### 🟡 問題 5: 資源查找效能未優化

**現況**:

```typescript
// 每次存取都需要 Map 查找
const effect = context.registry.getEffect(effectId)
const character = context.registry.getCharacter(characterId)
```

**問題**:

- 頻繁查找會有效能開銷（雖然 O(1)）
- 未來若切換到 Redis 等遠端儲存，會變成 async 操作

**建議**:

```typescript
// 引入快取層
class CachedResourceRegistry implements IResourceRegistry {
  private cache = new Map<string, any>()

  getEffect(id: string): IEffect | undefined {
    if (this.cache.has(id)) return this.cache.get(id)
    const effect = this.registry.getEffect(id)
    if (effect) this.cache.set(id, effect)
    return effect
  }
}
```

---

#### 🟡 問題 6: 缺乏錯誤處理

**現況**:

```typescript
// 幾乎所有方法都沒有 try-catch
execute(event: DamageEvent): void {
  for (const step of this.steps) {
    const shouldContinue = step.execute(event, context)
    if (!shouldContinue) break
  }
}
```

**問題**:

- 若某個 Step 拋出異常，整個戰鬥崩潰
- 無法追蹤錯誤來源
- 不符合工程穩健性要求

**建議**:

```typescript
execute(event: DamageEvent): void {
  for (const step of this.steps) {
    try {
      const shouldContinue = step.execute(event, context)
      if (!shouldContinue) break
    } catch (error) {
      console.error(`Step ${step.constructor.name} failed:`, error)
      context.eventBus.emit('combat:error', { step, error, event })
      break // 或繼續下一個 step
    }
  }
}
```

---

### 4.3 小問題

#### 🟢 問題 7: 缺乏單元測試

**現況**: 無任何測試檔案

**影響**: 重構風險高，無法保證正確性

**建議**:

- 優先測試 DamageChain（核心邏輯）
- 測試 AttributeCalculator（複雜計算）
- 測試 Effect 生命週期

---

#### 🟢 問題 8: 魔法數字與字串

**現況**:

```typescript
const sacrifice = maxHp * 0.2 // 20% 是什麼？
const damageMultiplier = 2.0 // 為何是 2？
```

**建議**:

```typescript
// 在 config 中定義
export const BloodPactConfig = {
  HP_SACRIFICE_RATIO: 0.2,
  DAMAGE_MULTIPLIER: 2.0,
  ATTACK_COUNT: 3,
} as const
```

---

#### 🟢 問題 9: 記憶體管理未考慮

**現況**:

- 戰鬥結束後，所有物件仍在記憶體中
- 未主動清理事件監聽器

**建議**:

```typescript
// 在 CombatEngine.dispose() 中
dispose(): void {
  this.ticker.stop()
  this.tickActionSystem.dispose()
  this.snapshotCollector.dispose()
  this.context.eventBus.removeAllListeners() // 清理所有監聽
  this.context.registry.clear() // 清空 Registry
}
```

---

## 五、下一步規劃建議

### 5.1 短期（1-2 週）

1. **解決循環依賴問題**
   - 實作 DIP 重構（參考 `dev_log/v0.5/循環.md`）
   - 將 `ICombatContext` 移至 `domain/shared/interfaces/`

2. **新增單元測試**
   - DamageChain 測試（8 個 Step）
   - AttributeCalculator 測試
   - Effect 生命週期測試

3. **完善錯誤處理**
   - 在關鍵路徑加入 try-catch
   - 新增 `combat:error` 事件

### 5.2 中期（1 個月）

1. **重構 CombatContext**
   - 拆分為 EntityRepository, TickProvider, Infrastructure

2. **時間系統抽象**
   - 引入 ITimeProvider
   - 支援可配置的 tick rate

3. **效能優化**
   - 實作快取層
   - Benchmark 測試（1000+ 回合戰鬥）

### 5.3 長期（3 個月+）

1. **UI 整合**
   - 戰鬥回放介面（基於 Replay 模組）
   - 即時戰鬥顯示

2. **戰鬥外系統**
   - 關卡選擇
   - 商店系統
   - 角色養成

3. **持久化**
   - 存檔系統
   - 資料庫整合（考慮 Redis）

---

## 六、總結

### 優點

1. ✅ **分層清晰**：六層架構，職責明確
2. ✅ **低耦合**：事件驅動，系統間鬆散耦合
3. ✅ **高可讀性**：命名語義化，註解完整
4. ✅ **可擴展**：Hook 機制，無需修改核心即可擴展
5. ✅ **型別安全**：充分利用 TypeScript 靜態檢查

### 缺點

1. ❌ **DIP 未徹底**：存在向上依賴
2. ❌ **God Object**：CombatContext 職責過多
3. ❌ **缺乏測試**：重構風險高
4. ❌ **錯誤處理不足**：穩健性待加強
5. ❌ **記憶體管理**：未考慮長時間運行

### 整體評價

**當前狀態**: ⭐⭐⭐⭐☆ (4/5)

- 作為 v0.5 原型，已展現良好的架構設計能力
- 核心功能完整可用，可支援複雜戰鬥模擬
- 需解決架構缺陷後，才適合進入生產環境

**建議**: 優先處理 DIP 問題與單元測試，再進行功能擴展。

---

**文檔版本**: v1.0  
**最後更新**: 2025-12-02  
**撰寫者**: GitHub Copilot (AI Assistant)
