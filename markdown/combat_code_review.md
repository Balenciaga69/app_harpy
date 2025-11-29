# Combat 模組代碼品質分析報告

> 分析時間: 2025-11-30
> 分析範圍: `src/modules/combat/`

## 📋 總覽

本報告針對 Combat 模組進行全面的代碼品質審查，聚焦於：
- Clean Code 原則違反
- SOLID 原則違反
- 命名與可讀性問題
- 檔案結構與職責劃分
- 可維護性改進建議

---

## 1. Character 模組

### 1.1 AttributeContainer.ts

#### 問題 1: 職責過多（違反 SRP）
- **問題**: `calculate()` 方法同時處理加法和乘法修飾器，且計算邏輯硬編碼
- **影響**: 未來若要新增其他計算模式（如優先級、條件計算）需修改此類
- **改進方案**:
  ```typescript
  // 拆分成獨立的計算策略
  interface IAttributeCalculationStrategy {
    calculate(base: number, modifiers: AttributeModifier[]): number
  }
  
  class StandardCalculationStrategy implements IAttributeCalculationStrategy {
    calculate(base: number, modifiers: AttributeModifier[]): number {
      // 加法 + 乘法邏輯
    }
  }
  ```

#### 問題 2: `setCurrentHp()` 命名不清晰
- **問題**: 方法名稱沒有表達出「會自動限制在 0 ~ maxHp 範圍」的行為
- **影響**: 使用者可能不清楚邊界處理邏輯
- **改進方案**: 改名為 `updateCurrentHp()` 或 `setCurrentHpClamped()`

#### 問題 3: 魔法數字
- **問題**: `Math.max(0, Math.min(value, maxHp))` 中的 `0` 是魔法數字
- **改進方案**: 定義常量 `MIN_HP = 0`

#### 問題 4: 缺少修飾器優先級機制
- **問題**: 目前修飾器沒有執行順序，可能導致計算結果不符合預期
- **影響**: 複雜效果疊加時難以預測結果
- **改進方案**: 為 `AttributeModifier` 增加 `priority` 屬性

### 1.2 Character.ts

#### 問題 1: CharacterConfig 可獨立成檔案
- **問題**: `CharacterConfig` 介面定義在類別內部，不利於複用
- **改進方案**: 移至 `models/character.model.ts`

#### 問題 2: 生命值初始化缺失
- **問題**: `constructor` 中沒有初始化 `currentHp`，需手動調用 `attributes.setCurrentHp()`
- **影響**: 容易忘記初始化，導致角色 HP 為 0
- **改進方案**:
  ```typescript
  constructor(config: CharacterConfig) {
    // ...
    this.attributes = new AttributeContainer(config.baseAttributes)
    // 自動初始化 currentHp
    this.attributes.setCurrentHp(config.baseAttributes.maxHp)
  }
  ```

#### 問題 3: `markDead()` 和 `revive()` 應觸發事件
- **問題**: 狀態變更但不發送事件，可能導致系統狀態不同步
- **改進方案**: 在方法內發送 `entity:death` 和 `entity:revive` 事件

### 1.3 models/attribute.model.ts

#### 問題 1: `AttributeType` 過於扁平
- **問題**: 所有屬性類型混在一起，沒有分類
- **影響**: 難以擴展，且不清楚哪些屬性是通用的，哪些是特定於攻擊/法術的
- **改進方案**:
  ```typescript
  // 分類定義
  type CoreAttribute = 'maxHp' | 'currentHp' | 'armor' | 'evasion' | 'accuracy'
  type AttackAttribute = 'attackDamage' | 'attackCooldown' | 'criticalChance' | 'criticalMultiplier'
  type SpellAttribute = 'spellDamage' | 'spellCooldown'
  
  export type AttributeType = CoreAttribute | AttackAttribute | SpellAttribute
  ```

#### 問題 2: `AttributeModifier` 的 `source` 欄位類型過於寬鬆
- **問題**: `source: string` 可以是任意字串，不利於追蹤來源
- **改進方案**: 改為 `source: { type: 'effect' | 'equipment', id: string }`

### 1.4 models/character.model.ts

#### 問題 1: 註解過多
- **問題**: `// Component 引用`、`// 方法`、`// 裝備引用 (後續擴展)` 等註解過於冗餘
- **影響**: 增加視覺噪音，降低可讀性
- **改進方案**: 移除這些自解釋的註解，只保留 TODO 註解

---

## 2. Core 模組

### 2.1 CombatContext.ts

#### 問題 1: `isCharacter()` 類型守衛放錯位置
- **問題**: 這是一個工具函數，不應該是 `CombatContext` 的方法
- **影響**: 違反 SRP，`CombatContext` 應該只負責數據管理
- **改進方案**: 移至 `shared/utils/typeGuards.util.ts`

#### 問題 2: `getEntitiesByTeam()` 返回可變陣列
- **問題**: 返回 `IEntity[]` 而非 `readonly IEntity[]`
- **影響**: 外部可以修改陣列，破壞封裝
- **改進方案**: 返回類型改為 `readonly IEntity[]`

#### 問題 3: Tick 管理可獨立成類
- **問題**: `currentTick`、`incrementTick()`、`resetTick()` 等方法與 Context 的核心職責無關
- **改進方案**: 提取成 `TickCounter` 類

#### 問題 4: 最後一行註解過於泛泛
- **問題**: `// 這裡可以加入更多戰鬥全域資訊，如 RNG 種子、戰鬥設定等`
- **影響**: 無實質幫助
- **改進方案**: 移除或改為具體的 TODO

### 2.2 CombatEngine.ts

#### 問題 1: 類別過於龐大（270+ 行）
- **問題**: 包含太多職責：初始化、戰鬥循環、統計計算、結果構建
- **影響**: 難以維護和測試
- **改進方案**: 拆分成多個類
  - `CombatInitializer`: 負責初始化系統和角色
  - `CombatStatisticsBuilder`: 負責統計數據計算
  - `CombatResultBuilder`: 負責構建最終結果
  - `CombatEngine`: 只負責協調流程

#### 問題 2: `config` 默認值設置方式不佳
- **問題**: 使用展開運算符 `{ maxTicks: 10000, ... config }` 難以追蹤默認值
- **改進方案**: 
  ```typescript
  const DEFAULT_CONFIG: Required<Omit<CombatConfig, 'playerTeam' | 'enemyTeam'>> = {
    maxTicks: 10000,
    snapshotInterval: 100,
    enableLogging: true,
    seed: Date.now()
  }
  
  this.config = { ...DEFAULT_CONFIG, ...config }
  ```

#### 問題 3: 魔法數字遍布
- **問題**: `100`, `10000`, `10, 20, 30, 40, 50` 等魔法數字
- **改進方案**: 定義常量
  ```typescript
  const TICKS_PER_SECOND = 100
  const DEFAULT_MAX_TICKS = 10000
  const HOLY_FIRE_THRESHOLDS = [10, 20, 30, 40, 50]
  ```

#### 問題 4: `recordKeyMoment()` 是空實作
- **問題**: 方法內只有 `void` 語句，實際未實作
- **影響**: 誤導開發者以為功能已完成
- **改進方案**: 加上 `// TODO: 實作關鍵時刻記錄` 或直接刪除

#### 問題 5: `calculateStatistics()` 方法過長且空洞
- **問題**: 初始化一堆數據結構，但實際計算邏輯都是 TODO
- **改進方案**: 拆分成多個小方法或暫時返回空對象並標記 TODO

#### 問題 6: `createSnapshot()` 創建邏輯重複
- **問題**: 在 `buildCombatResult()` 中使用循環創建快照，但邏輯分散
- **改進方案**: 統一快照管理，或由 `Ticker` 自動記錄

#### 問題 7: `determineOutcome()` 條件判斷過於複雜
- **問題**: 多層嵌套的 if-else
- **改進方案**: 使用策略模式或 early return
  ```typescript
  if (!playerAlive && !enemyAlive) return { outcome: 'draw', winner: null }
  if (!playerAlive) return { outcome: 'enemy-win', winner: 'enemy' }
  if (!enemyAlive) return { outcome: 'player-win', winner: 'player' }
  if (reachedMaxTicks) return { outcome: 'timeout', winner: null }
  return { outcome: 'draw', winner: null }
  ```

### 2.3 Ticker.ts

#### 問題 1: `shouldTakeSnapshot()` 和 `takeSnapshot()` 可合併
- **問題**: 兩個方法職責重疊，且都只在 `tick()` 中使用
- **改進方案**: 合併邏輯或移除 `shouldTakeSnapshot()`

#### 問題 2: `start()` 方法缺少錯誤處理
- **問題**: 如果戰鬥循環出錯，沒有任何捕獲機制
- **改進方案**: 加上 try-catch 並發送錯誤事件

#### 問題 3: `stop()` 方法過於簡單
- **問題**: 只設置 flag，沒有清理或發送事件
- **改進方案**: 發送 `combat:end` 事件

### 2.4 models/combatConfig.model.ts

#### 問題 1: 缺少文檔註解
- **問題**: 雖然有 JSDoc 標題，但各欄位沒有詳細說明
- **改進方案**: 為每個欄位加上註解，說明默認值和單位

### 2.5 models/combatResult.model.ts

#### 問題 1: `CombatOutcome` 應該是 enum
- **問題**: 使用字串聯合類型，但沒有語義化的命名
- **改進方案**:
  ```typescript
  export enum CombatOutcome {
    PlayerWin = 'player-win',
    EnemyWin = 'enemy-win',
    Draw = 'draw',
    Timeout = 'timeout'
  }
  ```

#### 問題 2: `KeyMoment['type']` 應獨立定義
- **問題**: 類型定義在 interface 內部，不利於複用
- **改進方案**:
  ```typescript
  export type KeyMomentType = 
    | 'first-blood' 
    | 'character-death' 
    | 'critical-hit' 
    | 'comeback' 
    | 'battle-start' 
    | 'battle-end'
  
  export interface KeyMoment {
    type: KeyMomentType
    // ...
  }
  ```

#### 問題 3: `CombatStatistics.characterStats` 使用 Map 不利於序列化
- **問題**: Map 無法直接 JSON 序列化
- **影響**: 如果需要保存戰鬥結果，會有問題
- **改進方案**: 改為 `Record<CharacterId, CharacterStats>` 或 `CharacterStats[]`

---

## 3. Damage 模組

### 3.1 DamageChain.ts

#### 問題 1: `collectHooks()` 方法的判斷邏輯不夠優雅
- **問題**: 使用 `'beforeDamageCalculation' in effect` 來判斷是否實作 Hook
- **影響**: 7 個 if 條件，可讀性差
- **改進方案**:
  ```typescript
  private collectHooks(character: ICharacter): ICombatHook[] {
    return character.effects
      .getAllEffects()
      .filter(effect => this.isHook(effect)) as ICombatHook[]
  }
  
  private isHook(effect: IEffect): effect is ICombatHook {
    return 'beforeDamageCalculation' in effect
      || 'onHitCheck' in effect
      // ...
  }
  ```

#### 問題 2: `critCheck()` 中的暴擊倍率應用邏輯重複
- **問題**: 對每個元素都寫一遍 `*= critMultiplier`
- **改進方案**:
  ```typescript
  if (event.isCrit) {
    const critMultiplier = event.source.attributes.get('criticalMultiplier') ?? 1.5
    Object.keys(event.damages).forEach(key => {
      event.damages[key as DamageType] *= critMultiplier
    })
  }
  ```

#### 問題 3: `calculateArmorReduction()` 公式缺乏彈性
- **問題**: 公式硬編碼在類中，難以調整平衡
- **改進方案**: 提取到配置或策略類

#### 問題 4: 魔法數字 `100`
- **問題**: `armor / (armor + 100)` 中的 100 是遊戲平衡常數
- **改進方案**: 定義常量 `ARMOR_CONSTANT = 100`

#### 問題 5: `emitMissEvent()` 和 `emitPreventedEvent()` 可合併
- **問題**: 兩個方法結構相似，只是事件名稱不同
- **改進方案**: 統一為 `emitCombatEvent(eventType, data)`

### 3.2 models/damageEvent.model.ts

#### 問題 1: `DamageType` 應該是 enum
- **問題**: 字串聯合類型不利於重構和類型安全
- **改進方案**:
  ```typescript
  export enum DamageType {
    Physical = 'physical',
    Fire = 'fire',
    Ice = 'ice',
    Lightning = 'lightning',
    Poison = 'poison',
    Chaos = 'chaos'
  }
  ```

#### 問題 2: `DamageEvent` 註解過多
- **問題**: 每個欄位前都有 `===` 分隔符和註解
- **影響**: 增加視覺負擔
- **改進方案**: 只在重要欄位加註解，或使用更簡潔的格式

#### 問題 3: `tags` 使用 `Set<string>` 類型不安全
- **問題**: 標籤內容沒有限制，容易拼錯
- **改進方案**:
  ```typescript
  type DamageTag = 'attack' | 'spell' | 'melee' | 'ranged' | 'crit' | 'aoe'
  tags: Set<DamageTag>
  ```

### 3.3 utils/damageCalculator.util.ts

#### 問題 1: 所有函數都是 TODO
- **問題**: 實際上只有公式，但標記為 TODO
- **影響**: 誤導開發者
- **改進方案**: 移除 TODO 註解，或明確說明「公式待平衡調整」

#### 問題 2: `calculateArmorReduction()` 與 `DamageChain` 中的重複
- **問題**: 護甲計算邏輯在兩處定義
- **影響**: 修改時容易遺漏
- **改進方案**: 統一使用 util 中的函數

#### 問題 3: 魔法數字
- **問題**: `5`, `0.9`, `0.1` 等魔法數字
- **改進方案**: 定義常量

---

## 4. Effect 模組

### 4.1 EffectManager.ts

#### 問題 1: `addEffect()` 沒有處理重複效果的策略
- **問題**: 直接返回，但可能需要疊加或刷新效果
- **影響**: 部分效果（如 Buff）應該可以刷新持續時間
- **改進方案**: 增加 `IEffect.onRefresh()` 方法

#### 問題 2: `onTick()` 沒有錯誤處理
- **問題**: 如果某個 Effect 的 `onTick()` 拋出異常，會中斷整個循環
- **改進方案**: 加上 try-catch

#### 問題 3: 缺少獲取特定類型效果的方法
- **問題**: 需要手動過濾 `getAllEffects()`
- **改進方案**:
  ```typescript
  getEffectsByName(name: string): IEffect[]
  getEffectsByType<T extends IEffect>(type: new (...args: any[]) => T): T[]
  ```

### 4.2 models/effect.model.ts

#### 問題 1: `IEffect` 和 `ICombatHook` 應該分開到不同檔案
- **問題**: 兩個職責不同的介面混在一起
- **改進方案**:
  - `effect.model.ts`: 定義 `IEffect`
  - `combatHook.model.ts`: 定義 `ICombatHook`

#### 問題 2: `onTick` 是可選方法，但缺少說明
- **問題**: 開發者不清楚何時應該實作
- **改進方案**: 加上 JSDoc 註解

### 4.3 models/stackableEffect.model.ts

#### 問題 1: `StackableEffect` 抽象類但 `onTick` 標記為 `abstract`
- **問題**: `onTick?` 是可選的，不應該強制子類實作
- **改進方案**: 移除 `abstract` 關鍵字

#### 問題 2: `addStacks()` 等方法沒有觸發事件
- **問題**: 層數變更但無法被系統感知
- **改進方案**: 增加 `onStacksChanged()` 回調或發送事件

#### 問題 3: 使用 `Infinity` 作為無上限的表示
- **問題**: 雖然可行，但語義不清晰
- **改進方案**: 定義常量 `NO_STACK_LIMIT = -1` 或使用 `null`

### 4.4 Implementation/NativeStatus

#### 問題 1: 四個效果類代碼高度重複
- **問題**: `ChargeEffect`、`ChillEffect`、`HolyFireEffect`、`PoisonEffect` 都有類似的結構
- **影響**: 違反 DRY 原則
- **改進方案**: 提取共同邏輯到抽象基類
  ```typescript
  abstract class TimedStackableEffect extends StackableEffect {
    protected lastDecayTick: number = 0
    protected readonly decayRate: number
    
    abstract onDecay(character: ICharacter, context: CombatContext): void
  }
  ```

#### 問題 2: `100` 魔法數字（Ticks per second）
- **問題**: 在多個檔案中重複出現
- **改進方案**: 定義全域常量 `TICKS_PER_SECOND = 100`

#### 問題 3: `nanoid(6)` 的 `6` 是魔法數字
- **問題**: ID 長度硬編碼
- **改進方案**: 定義常量 `EFFECT_ID_LENGTH = 6`

#### 問題 4: 修飾器 ID 生成邏輯重複
- **問題**: `${this.id}-attack-cd` 等字串拼接在多處重複
- **改進方案**: 提取到方法
  ```typescript
  private createModifierId(type: string): string {
    return `${this.id}-${type}`
  }
  ```

#### 問題 5: `ChargeEffect` 和 `ChillEffect` 幾乎一模一樣
- **問題**: 只有正負號不同
- **改進方案**: 合併成一個類，用參數控制
  ```typescript
  class CooldownModifierEffect extends StackableEffect {
    constructor(
      name: string,
      isReduction: boolean, // true=充能, false=冰緩
      maxStacks: number
    ) { }
  }
  ```

#### 問題 6: `HolyFireEffect.checkThresholdEffects()` 是空實作
- **問題**: 只發送了空事件
- **改進方案**: 完成實作或移除方法

#### 問題 7: `PoisonEffect` 直接修改 HP，繞過了 DamageChain
- **問題**: 違反了統一的傷害處理流程
- **影響**: 部分 Hook 無法作用於毒傷害
- **改進方案**: 創建特殊的 DamageEvent（毒傷害）並經過 DamageChain

### 4.5 Implementation/Equipment

#### 問題 1: `getOwner()` 方法重複
- **問題**: `ChargedCriticalEffect` 和 `LowHealthArmorEffect` 都有相同的方法
- **改進方案**: 提取到共同基類或工具函數

#### 問題 2: 健康值門檻 `0.3` 是魔法數字
- **問題**: 在 `LowHealthArmorEffect` 中硬編碼
- **改進方案**: 作為構造參數或常量

#### 問題 3: `LowHealthArmorEffect` 計算護甲減免的邏輯錯誤
- **問題**: 計算了兩次護甲減免，導致公式不正確
- **改進方案**: 重構計算邏輯，使用統一的護甲公式

---

## 5. Event 模組

### 5.1 EventBus.ts

#### 問題 1: `clear()` 方法通過重新創建實例來實現
- **問題**: 這是一個 hack 方法，不夠優雅
- **影響**: 外部持有的引用會失效
- **改進方案**: 手動移除所有監聽器或使用支援 `clear()` 的事件庫

#### 問題 2: `eslint-disable` 註解過於寬鬆
- **問題**: 禁用了整個檔案的 `@typescript-eslint/no-explicit-any`
- **改進方案**: 只在必要的行禁用

#### 問題 3: `onAll()` 的類型轉換不安全
- **問題**: 使用 `as any` 強制轉型
- **改進方案**: 使用更安全的類型定義

### 5.2 combatEventMap.model.ts

#### 問題 1: `'combat:end'` 的 payload 應該包含更多資訊
- **問題**: 只有 `winnerId`，但可能需要 outcome 等
- **改進方案**: 定義完整的 payload 結構

#### 問題 2: 部分事件的 payload 過於簡單
- **問題**: 如 `'entity:heal'` 沒有 `sourceId`
- **改進方案**: 統一事件 payload 結構

#### 問題 3: `CharacterSnapshot` 定義在事件模組中不合適
- **問題**: 這是數據模型，應該在 `character/models` 或 `core/models` 中
- **改進方案**: 移至 `core/models/snapshot.model.ts`

---

## 6. Logger 模組

### 6.1 EventLogger.ts

#### 問題 1: `currentTick` 狀態與 Context 重複
- **問題**: Logger 自己維護 tick 狀態，與 CombatContext 重複
- **影響**: 可能不同步
- **改進方案**: 直接從 Context 獲取

#### 問題 2: `setupListeners()` 中的類型推斷不完整
- **問題**: `payload as Record<string, unknown>` 過於寬鬆
- **改進方案**: 使用泛型來保證類型安全

#### 問題 3: 提取欄位的邏輯過於簡陋
- **問題**: 只檢查 `sourceId` 和 `targetId`，但可能有其他通用欄位
- **改進方案**: 定義統一的事件 payload 基類

### 6.2 combatLog.model.ts

#### 問題 1: `CombatLogEntry` 結構過於扁平
- **問題**: `sourceId` 和 `targetId` 可能為空，且與 payload 重複
- **改進方案**: 移除冗餘欄位，統一使用 payload

---

## 7. Systems 模組

### 7.1 AbilitySystem.ts

#### 問題 1: 類別過於龐大（150+ 行）
- **問題**: 包含攻擊冷卻、目標選擇、傷害創建、效果施加等多種職責
- **改進方案**: 拆分成多個類
  - `CooldownTracker`: 追蹤冷卻時間
  - `TargetSelector`: 選擇目標
  - `AttackExecutor`: 執行攻擊

#### 問題 2: `selectTarget()` 邏輯過於簡單
- **問題**: 只攻擊第一個敵人，不符合遊戲設計
- **改進方案**: 實作智能目標選擇（優先攻擊低血量、特定職業等）

#### 問題 3: `canAttack()` 中的隨機延遲缺乏說明
- **問題**: 初次攻擊有隨機延遲，但沒有註解說明原因
- **改進方案**: 加上註解說明這是為了避免所有角色同時攻擊

#### 問題 4: `applyElementalEffects()` 硬編碼效果映射
- **問題**: 傷害類型與效果的對應關係寫死
- **影響**: 新增元素類型需修改此方法
- **改進方案**: 使用映射表
  ```typescript
  const DAMAGE_TO_EFFECT_MAP: Record<DamageType, () => IEffect> = {
    fire: () => new HolyFireEffect(),
    ice: () => new ChillEffect(),
    lightning: () => new ChargeEffect(),
    poison: () => new PoisonEffect(),
  }
  ```

#### 問題 5: `createDamageEvent()` 只創建物理傷害
- **問題**: 缺乏元素傷害支援
- **影響**: 無法實作法術攻擊
- **改進方案**: 根據武器/技能類型創建不同元素的傷害

#### 問題 6: 魔法數字 `100`（冷卻時間單位）
- **問題**: 在 `canAttack()` 中使用但未定義
- **改進方案**: 定義 `TICKS_PER_SECOND`

#### 問題 7: 直接 import 具體的 Effect 類
- **問題**: 違反依賴倒置原則
- **改進方案**: 通過依賴注入或工廠模式創建效果

### 7.2 TickerSystem.ts

#### 問題 1: 類別過於簡單，可能不需要獨立
- **問題**: 只有一個 `processTick()` 方法
- **影響**: 增加不必要的抽象層
- **改進方案**: 考慮合併到 `Ticker` 或 `CombatEngine` 中

#### 問題 2: `processTick()` 沒有錯誤處理
- **問題**: 如果某個 Effect 的 `onTick()` 拋出異常，會中斷整個系統
- **改進方案**: 加上 try-catch

---

## 8. Shared 模組

### 8.1 models/entity.model.ts

#### 問題 1: `IEntity` 過於空洞
- **問題**: 只有基礎欄位，沒有實質內容
- **影響**: 不清楚 Entity 應該有哪些職責
- **改進方案**: 加上更多註解說明設計意圖

### 8.2 utils/random.util.ts

#### 問題 1: 類別命名過長
- **問題**: `CombatRandomGenerator` 可簡化
- **改進方案**: 改名為 `RandomGenerator` 或 `RNG`

#### 問題 2: `getSeed()` 方法可能不夠用
- **問題**: 無法重置種子或創建新的 RNG
- **改進方案**: 增加 `reset()` 和 `fork()` 方法

---

## 9. 檔案結構問題

### 9.1 index.ts 缺失
- **問題**: 大部分子模組都沒有 `index.ts` 作為統一出口
- **影響**: import 路徑冗長，難以管理
- **改進方案**: 為每個模組增加 `index.ts`

### 9.2 models 和 utils 混用
- **問題**: 部分 utils 定義在 models 檔案中（如 `damageEvent.model.ts` 中的函數）
- **改進方案**: 嚴格區分 models（類型定義）和 utils（工具函數）

### 9.3 Implementation 資料夾命名不規範
- **問題**: 使用大寫開頭，不符合資料夾命名慣例
- **改進方案**: 改為 `implementations` 或 `effects`

### 9.4 NativeStatus 命名不清晰
- **問題**: 「Native」的含義模糊
- **改進方案**: 改為 `StatusEffects` 或 `ElementalEffects`

---

## 10. 通用問題

### 10.1 魔法數字過多
- **問題**: `100`, `0.04`, `0.1`, `16`, `50` 等數字散布在代碼中
- **改進方案**: 統一定義到 `constants.ts`
  ```typescript
  export const GAME_CONSTANTS = {
    TICKS_PER_SECOND: 100,
    DEFAULT_MAX_TICKS: 10000,
    MAX_CHARGE_STACKS: 16,
    MAX_CHILL_STACKS: 16,
    MAX_HOLY_FIRE_STACKS: 50,
    CHARGE_REDUCTION_PER_STACK: 0.04,
    DECAY_RATE: 0.1,
  } as const
  ```

### 10.2 TODO 註解過多
- **問題**: 超過 20 處 TODO，部分已過時
- **改進方案**: 清理已完成的 TODO，將未完成的轉為 GitHub Issues

### 10.3 類型定義與實作混在同一檔案
- **問題**: 如 `StackableEffect` 介面和類別在同一檔案
- **改進方案**: 分離介面和實作

### 10.4 缺少單元測試
- **問題**: 整個模組沒有測試檔案
- **影響**: 重構時無法保證正確性
- **改進方案**: 為核心類別（`AttributeContainer`, `DamageChain`, `EffectManager`）編寫測試

### 10.5 錯誤處理缺失
- **問題**: 幾乎所有方法都沒有錯誤處理
- **影響**: 出錯時難以定位問題
- **改進方案**: 加上錯誤邊界和日誌記錄

---

## 📊 優先級建議

### 🔴 高優先級（影響功能正確性）
1. 修復 `PoisonEffect` 繞過 DamageChain 的問題
2. 修復 `LowHealthArmorEffect` 護甲計算錯誤
3. 為 `Character` 構造函數自動初始化 `currentHp`
4. 統一 `calculateArmorReduction()` 的實作（移除重複）
5. 為所有異步操作加上錯誤處理

### 🟡 中優先級（影響可維護性）
1. 拆分 `CombatEngine` 為多個類
2. 拆分 `AbilitySystem` 為多個類
3. 提取魔法數字到常量檔案
4. 合併 `ChargeEffect` 和 `ChillEffect`
5. 提取 Native Effects 的共同邏輯到基類
6. 為所有模組增加 `index.ts`
7. 移除過時的 TODO 註解

### 🟢 低優先級（優化代碼品質）
1. 將字串聯合類型改為 enum
2. 改進命名（如 `setCurrentHp` → `updateCurrentHp`）
3. 移除冗餘註解
4. 統一檔案結構（models vs utils）
5. 改進類型安全（移除 `as any`）
6. 增加單元測試

---

## 📝 結論

Combat 模組整體架構良好，遵循了 ECS 和事件驅動設計，但在細節實作上存在不少可改進之處：

1. **職責劃分**: 部分類別過於龐大（`CombatEngine`, `AbilitySystem`），需拆分
2. **代碼重複**: Effect 實作高度重複，需提取共同邏輯
3. **魔法數字**: 遊戲常數散布各處，需統一管理
4. **類型安全**: 過多字串類型，應改用 enum 或字串字面量
5. **錯誤處理**: 幾乎完全缺失，需補充
6. **測試**: 無單元測試，影響重構信心

建議按照優先級逐步改進，先解決功能性問題，再優化代碼品質。
