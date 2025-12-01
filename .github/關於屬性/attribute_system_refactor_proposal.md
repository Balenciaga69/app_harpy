# 屬性系統重構提案

## 📋 文件資訊

- **版本**: v1.0
- **日期**: 2025-12-01
- **提案人**: Tech Lead
- **目標版本**: v0.3

---

## 🎯 需求分析

### 業主期望的數值範圍

根據業主提供的遊戲機制設計：

| 屬性          | 期望範圍   | 備註                               |
| ------------- | ---------- | ---------------------------------- |
| **生命值**    | 500 - 3000 | 常態範圍（坦克可更高）             |
| **能量**      | 0 - 100    | 固定上限                           |
| **護甲**      | 0 - 600    | 撐到 600 應該很困難                |
| **命中/閃避** | 0 - 1000   | 不應超過 1000（平衡考量）          |
| **攻擊速度**  | 0.2s - 2s  | (20 - 200 ticks，100 tick = 1 sec) |
| **暴擊率**    | 5% - 10%   | 基礎範圍，可透過裝備提升           |
| **暴擊倍率**  | 150%       | 基礎值，可透過裝備提升             |

### 公式設計需求

#### 1. 護甲減免公式

```
減免率 = 護甲 / (護甲 + K)
```

- **K 值**: 可配置係數（業主建議 100）
- **特性**:
  - 護甲值越高，邊際效益遞減
  - 護甲 = 100 時，減免 50%
  - 護甲 = 600 時，減免 85.7%（接近極限）
- **限制**: 最高減免 90%（避免無敵）

#### 2. 閃避機制

```
閃避率 = (閃避值 - 命中值) / 100
最小閃避率 = 5%
最大閃避率 = 80%
```

- **閃避成功懲罰**: 閃避係數 × 0.8（降低連續閃避機率）
- **閃避失敗回復**: 閃避係數恢復為 1.0
- **目的**: 避免極端的「閃避流」或「永不閃避」

#### 3. 能量系統

```
普通攻擊獲得能量 = 3 點/次
自然回復 = 1 點/100 ticks（每秒）
大招消耗 = 100 點（滿能量）
```

- **設計意圖**: 約 25-30 次攻擊可釋放一次大招（配合自然回復）

---

## 🔍 當前系統問題分析

### 問題 1: 屬性定義不完整

**現況**:

```typescript
export interface BaseAttributeValues {
  maxHp: number
  maxEnergy: number
  energyRegen: number
  energyGainOnAttack: number
  armor: number
  evasion: number
  accuracy: number
  attackDamage?: number // ❌ 可選，但實際是必需的
  attackCooldown?: number // ❌ 可選，但實際是必需的
  criticalChance?: number // ❌ 可選，導致計算時需要 ?? 0
  criticalMultiplier?: number // ❌ 可選，導致計算時需要 ?? 1.5
}
```

**問題**:

- 可選屬性導致每次使用都要寫 `??` 處理預設值
- 缺少明確的預設值定義
- 新增角色時容易遺漏必填屬性

---

### 問題 2: 缺少屬性驗證與限制

**現況**:

```typescript
setBase(type: AttributeType, value: number): void {
  this.baseValues.set(type, value) // ❌ 無驗證，可設置負數或超出範圍
}
```

**問題**:

- 可設置 `maxHp: -100` 或 `criticalChance: 999`
- 護甲/閃避/命中可超過設計上限（1000）
- 無法強制業務規則

---

### 問題 3: 公式實作不符合設計

**現況** (`damage.calculator.util.ts`):

```typescript
export function calculateArmorReduction(armor: number, damage: number): number {
  const reduction = armor / (armor + damage * 5) // ❌ 使用 damage * 5 而非固定 K
  return Math.min(0.9, Math.max(0, reduction))
}

export function calculateHitChance(accuracy: number, evasion: number): number {
  const hitChance = accuracy / (accuracy + evasion) // ❌ 不符合業主公式
  return Math.min(1, Math.max(0.1, hitChance))
}
```

**問題**:

- 護甲公式依賴傷害值（不合理，護甲應該是固定減免）
- 命中公式錯誤（業主要求: `(閃避 - 命中) / 100`）
- 缺少閃避成功後的懲罰機制

---

### 問題 4: 缺少遊戲配置層

**問題**:

- 魔法數字散落各處 (`100`, `0.9`, `1.5` 等)
- 無法快速調整遊戲平衡
- 測試時難以修改參數

---

## 🛠️ 重構方案

### 方案 1: 建立遊戲配置層 (Game Config)

**位置**: `src/modules/combat/infra/config/`

**檔案結構**:

```
infra/
  config/
    game.config.ts          # 遊戲全域配置
    attribute.constants.ts   # 屬性常數定義
    formula.constants.ts     # 公式係數定義
    index.ts
```

#### `attribute.constants.ts`

```typescript
/**
 * 屬性系統的限制與預設值
 */

/** 屬性預設值 */
export const AttributeDefaults = {
  // === 生命相關 ===
  maxHp: 1000,
  currentHp: 1000,

  // === 能量相關 ===
  maxEnergy: 100,
  currentEnergy: 0,
  energyRegen: 1, // 每 100 tick 回復 1 點
  energyGainOnAttack: 3, // 普攻命中獲得 3 點

  // === 攻擊相關 ===
  attackDamage: 100,
  attackCooldown: 100, // 1 秒（100 ticks）

  // === 防禦相關 ===
  armor: 50,
  evasion: 100,
  accuracy: 100,

  // === 暴擊相關 ===
  criticalChance: 0.05, // 5%
  criticalMultiplier: 1.5, // 150%
} as const

/** 屬性上限值（用於驗證） */
export const AttributeLimits = {
  // === 生命 ===
  maxHp: { min: 1, max: 99999 },
  currentHp: { min: 0, max: 99999 },

  // === 能量 ===
  maxEnergy: { min: 1, max: 100 }, // 固定 100
  currentEnergy: { min: 0, max: 100 },
  energyRegen: { min: 0, max: 10 }, // 最多每秒回 10 點
  energyGainOnAttack: { min: 0, max: 50 },

  // === 攻擊 ===
  attackDamage: { min: 1, max: 9999 },
  attackCooldown: { min: 20, max: 500 }, // 0.2s - 5s

  // === 防禦（業主要求：不超過 1000） ===
  armor: { min: 0, max: 600 }, // 撐到 600 很困難
  evasion: { min: 0, max: 1000 },
  accuracy: { min: 0, max: 1000 },

  // === 暴擊 ===
  criticalChance: { min: 0, max: 1 }, // 0% - 100%
  criticalMultiplier: { min: 1, max: 10 }, // 100% - 1000%
} as const

/** 屬性類型檢查 */
export type AttributeLimitKey = keyof typeof AttributeLimits
```

#### `formula.constants.ts`

```typescript
/**
 * 遊戲公式相關的係數與配置
 */

/** 護甲減免公式配置 */
export const ArmorFormula = {
  /** K 係數（業主建議值：100） */
  K_COEFFICIENT: 100,

  /** 最大減免率（避免無敵） */
  MAX_REDUCTION: 0.9, // 90%

  /** 計算減免率：armor / (armor + K) */
  calculate(armor: number): number {
    if (armor <= 0) return 0
    const reduction = armor / (armor + this.K_COEFFICIENT)
    return Math.min(this.MAX_REDUCTION, Math.max(0, reduction))
  },
} as const

/** 閃避機制配置 */
export const EvasionFormula = {
  /** 閃避率計算除數 */
  DIVIDER: 100,

  /** 最小閃避率 */
  MIN_EVASION_RATE: 0.05, // 5%

  /** 最大閃避率 */
  MAX_EVASION_RATE: 0.8, // 80%

  /** 閃避成功後的係數懲罰 */
  SUCCESS_PENALTY: 0.8,

  /** 閃避失敗後係數恢復 */
  FAILURE_RESET: 1.0,

  /** 計算閃避率：(evasion - accuracy) / 100 */
  calculate(evasion: number, accuracy: number): number {
    const rate = (evasion - accuracy) / this.DIVIDER
    return Math.min(this.MAX_EVASION_RATE, Math.max(this.MIN_EVASION_RATE, rate))
  },
} as const

/** 暴擊機制配置 */
export const CriticalFormula = {
  /** 預設暴擊倍率 */
  DEFAULT_MULTIPLIER: 1.5,

  /** 計算暴擊傷害 */
  calculate(baseDamage: number, critMultiplier: number = this.DEFAULT_MULTIPLIER): number {
    return baseDamage * critMultiplier
  },
} as const

/** 能量系統配置 */
export const EnergyConfig = {
  /** 大招消耗能量 */
  ULTIMATE_COST: 100,

  /** 能量回復間隔（ticks） */
  REGEN_INTERVAL: 100, // 每 100 tick = 1 秒
} as const

/** Tick 時間配置 */
export const TickConfig = {
  /** 每秒的 Tick 數 */
  TICKS_PER_SECOND: 100,

  /** Tick 轉秒 */
  toSeconds(ticks: number): number {
    return ticks / this.TICKS_PER_SECOND
  },

  /** 秒轉 Tick */
  fromSeconds(seconds: number): number {
    return seconds * this.TICKS_PER_SECOND
  },
} as const
```

---

### 方案 2: 強化屬性系統（加入驗證）

#### 修改 `AttributeContainer`

```typescript
import { AttributeLimits, AttributeDefaults } from '@/modules/combat/infra/config'

export class AttributeContainer {
  // ...existing code...

  /** 設置基礎屬性值（帶驗證） */
  setBase(type: AttributeType, value: number): void {
    const validatedValue = this.validateAttribute(type, value)
    this.baseValues.set(type, validatedValue)
  }

  /** 驗證屬性值是否在合法範圍內 */
  private validateAttribute(type: AttributeType, value: number): number {
    const limit = AttributeLimits[type as keyof typeof AttributeLimits]

    if (!limit) {
      console.warn(`No limit defined for attribute: ${type}`)
      return value
    }

    // 限制在最小值與最大值之間
    const clamped = Math.min(limit.max, Math.max(limit.min, value))

    // 開發模式下警告超出範圍
    if (clamped !== value && import.meta.env.DEV) {
      console.warn(`Attribute ${type} value ${value} clamped to ${clamped} (min: ${limit.min}, max: ${limit.max})`)
    }

    return clamped
  }
}
```

---

### 方案 3: 重構傷害計算公式

#### 修改 `damage.calculator.util.ts`

```typescript
import { ArmorFormula, EvasionFormula, CriticalFormula } from '@/modules/combat/infra/config'

/**
 * 計算護甲減免百分比
 *
 * 公式：armor / (armor + K)
 * - K = 100（可配置）
 * - 護甲 100 → 50% 減免
 * - 護甲 600 → 85.7% 減免
 * - 最大減免 90%
 */
export function calculateArmorReduction(armor: number): number {
  return ArmorFormula.calculate(armor)
}

/**
 * 計算閃避率
 *
 * 公式：(evasion - accuracy) / 100
 * - 最小 5%
 * - 最大 80%
 */
export function calculateEvasionChance(evasion: number, accuracy: number): number {
  return EvasionFormula.calculate(evasion, accuracy)
}

/**
 * 計算命中率
 */
export function calculateHitChance(accuracy: number, evasion: number): number {
  return 1 - calculateEvasionChance(evasion, accuracy)
}

/**
 * 計算暴擊倍率後的傷害
 */
export function applyCritMultiplier(baseDamage: number, critMultiplier?: number): number {
  return CriticalFormula.calculate(baseDamage, critMultiplier)
}
```

---

### 方案 4: 引入閃避係數系統

#### 新增 `EvasionManager` (Character 內部)

```typescript
/**
 * 閃避係數管理器
 *
 * 設計理念：
 * - 管理閃避成功/失敗後的係數變化
 * - 避免連續閃避或永不閃避的極端情況
 */
export class EvasionManager {
  private coefficient: number = 1.0

  /** 獲取當前閃避係數 */
  getCoefficient(): number {
    return this.coefficient
  }

  /** 閃避成功後降低係數 */
  onEvasionSuccess(): void {
    this.coefficient *= EvasionFormula.SUCCESS_PENALTY // × 0.8
  }

  /** 閃避失敗後恢復係數 */
  onEvasionFailure(): void {
    this.coefficient = EvasionFormula.FAILURE_RESET // = 1.0
  }

  /** 計算最終閃避率（含係數） */
  calculateFinalEvasionRate(baseRate: number): number {
    return baseRate * this.coefficient
  }
}
```

#### 修改 `HitCheckStep`

```typescript
export class HitCheckStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    // 真實傷害必定命中
    if (event.isTrueDamage) {
      event.isHit = true
      return true
    }

    // 獲取屬性
    const accuracy = event.source.getAttribute('accuracy')
    const evasion = event.target.getAttribute('evasion')

    // 計算基礎閃避率
    const baseEvasionRate = calculateEvasionChance(evasion, accuracy)

    // 獲取目標的閃避管理器（需要在 Character 中加入）
    const evasionManager = event.target.getEvasionManager()
    const finalEvasionRate = evasionManager.calculateFinalEvasionRate(baseEvasionRate)

    // 隨機判定
    const roll = context.rng.next()
    const evaded = roll < finalEvasionRate

    // 更新閃避係數
    if (evaded) {
      evasionManager.onEvasionSuccess()
    } else {
      evasionManager.onEvasionFailure()
    }

    event.isHit = !evaded

    // 發送閃避事件
    if (evaded) {
      context.eventBus.emit('combat:miss', {
        sourceId: event.source.id,
        targetId: event.target.id,
        tick: context.getCurrentTick(),
      })
    }

    return event.isHit
  }
}
```

---

### 方案 5: 修正護甲計算（DefenseCalculationStep）

#### 修改前（錯誤）

```typescript
export class DefenseCalculationStep implements IDamageStep {
  execute(event: DamageEvent, _context: CombatContext): boolean {
    if (event.isTrueDamage) return true

    const armor = event.target.getAttribute('armor')
    const armorReduction = calculateArmorReduction(armor, event.amount) // ❌ 依賴傷害值
    const reducedDamage = event.amount * (1 - armorReduction)
    event.amount = Math.max(1, reducedDamage)
    return true
  }
}
```

#### 修改後（正確）

```typescript
export class DefenseCalculationStep implements IDamageStep {
  execute(event: DamageEvent, _context: CombatContext): boolean {
    // 真實傷害無視防禦
    if (event.isTrueDamage) return true

    // 獲取護甲值
    const armor = event.target.getAttribute('armor')

    // 計算減免率（使用新公式）
    const reductionRate = calculateArmorReduction(armor)

    // 計算減免後傷害
    const reducedDamage = event.amount * (1 - reductionRate)

    // 確保最小傷害為 1
    event.amount = Math.max(1, reducedDamage)

    return true
  }
}
```

---

### 方案 6: 完善 BaseAttributeValues 定義

#### 修改 `attribute.core.model.ts`

```typescript
import { AttributeDefaults } from '@/modules/combat/infra/config'

/**
 * 基礎屬性值配置
 *
 * 所有屬性都是必填，使用明確的預設值
 */
export interface BaseAttributeValues {
  // === 生命相關 ===
  maxHp: number
  currentHp: number // 初始化時通常等於 maxHp

  // === 能量相關 ===
  maxEnergy: number
  currentEnergy: number
  energyRegen: number // 每 100 tick 回復量
  energyGainOnAttack: number // 普攻命中獲得量

  // === 攻擊相關 ===
  attackDamage: number
  attackCooldown: number // 單位：tick (100 tick = 1 sec)

  // === 防禦相關 ===
  armor: number
  evasion: number
  accuracy: number

  // === 暴擊相關 ===
  criticalChance: number // 0-1 範圍 (0.05 = 5%)
  criticalMultiplier: number // 倍率 (1.5 = 150%)
}

/**
 * 建立預設屬性值
 *
 * 使用此函數確保所有屬性都有合理的初始值
 */
export function createDefaultAttributes(overrides?: Partial<BaseAttributeValues>): BaseAttributeValues {
  return {
    maxHp: AttributeDefaults.maxHp,
    currentHp: AttributeDefaults.currentHp,
    maxEnergy: AttributeDefaults.maxEnergy,
    currentEnergy: AttributeDefaults.currentEnergy,
    energyRegen: AttributeDefaults.energyRegen,
    energyGainOnAttack: AttributeDefaults.energyGainOnAttack,
    attackDamage: AttributeDefaults.attackDamage,
    attackCooldown: AttributeDefaults.attackCooldown,
    armor: AttributeDefaults.armor,
    evasion: AttributeDefaults.evasion,
    accuracy: AttributeDefaults.accuracy,
    criticalChance: AttributeDefaults.criticalChance,
    criticalMultiplier: AttributeDefaults.criticalMultiplier,
    ...overrides, // 允許覆寫部分屬性
  }
}
```

---

## 📁 檔案結構變更

### 新增檔案

```
src/modules/combat/
  infra/
    config/                           # 🆕 遊戲配置層
      attribute.constants.ts          # 🆕 屬性常數
      formula.constants.ts            # 🆕 公式係數
      game.config.ts                  # 🆕 全域配置
      index.ts                        # 🆕
  domain/
    character/
      evasion.manager.ts              # 🆕 閃避係數管理器
```

### 修改檔案

```
src/modules/combat/
  domain/
    character/
      models/
        attribute.core.model.ts       # ✏️ 加入 createDefaultAttributes
      attribute.container.ts          # ✏️ 加入 validateAttribute
      character.ts                    # ✏️ 加入 EvasionManager
  logic/
    damage/
      utils/
        damage.calculator.util.ts     # ✏️ 修正公式實作
      steps/
        DefenseCalculationStep.ts     # ✏️ 修正護甲計算
        HitCheckStep.ts               # ✏️ 加入閃避係數
```

---

## 🔄 遷移步驟

### Step 1: 建立配置層（無破壞性）

1. 建立 `infra/config/` 資料夾
2. 新增 `attribute.constants.ts`
3. 新增 `formula.constants.ts`
4. 新增 `game.config.ts` 與 `index.ts`

**風險**: ✅ 無風險（純新增）

---

### Step 2: 重構傷害計算公式（中風險）

1. 修改 `damage.calculator.util.ts`
2. 修改 `DefenseCalculationStep.ts`
3. 執行單元測試驗證

**風險**: ⚠️ 中等（影響戰鬥平衡）

**驗證方法**:

- 測試護甲 0/100/600 的減免率
- 測試閃避/命中的極端值

---

### Step 3: 加入屬性驗證（低風險）

1. 修改 `AttributeContainer.setBase`
2. 加入 `validateAttribute` 方法

**風險**: ✅ 低風險（僅限制範圍）

---

### Step 4: 引入閃避係數系統（高風險）

1. 建立 `EvasionManager`
2. 修改 `Character` 加入 `evasionManager`
3. 修改 `HitCheckStep`
4. 加入 `ICharacter` 介面方法

**風險**: 🔴 高風險（新增複雜邏輯）

**建議**: 先在分支測試，確認平衡性後再合併

---

### Step 5: 完善屬性定義（破壞性）

1. 修改 `BaseAttributeValues`（移除可選標記）
2. 加入 `createDefaultAttributes` 輔助函數
3. 更新所有建立角色的地方

**風險**: 🔴 破壞性變更（需要更新所有角色建立代碼）

**建議**: 最後執行，確保其他步驟穩定

---

## 🎯 範例：角色建立（修改前後對比）

### 修改前

```typescript
const warrior = new Character({
  name: '戰士',
  team: 'player',
  baseAttributes: {
    maxHp: 1200,
    maxEnergy: 100,
    energyRegen: 1,
    energyGainOnAttack: 3,
    armor: 80,
    evasion: 50,
    accuracy: 150,
    attackDamage: 120, // 可能遺漏
    attackCooldown: 100, // 可能遺漏
    // criticalChance 未設置 → 使用時 ?? 0
  },
})
```

### 修改後

```typescript
import { createDefaultAttributes } from '@/modules/combat/domain/character'

const warrior = new Character({
  name: '戰士',
  team: 'player',
  baseAttributes: createDefaultAttributes({
    // 只覆寫需要自訂的屬性
    maxHp: 1200,
    currentHp: 1200,
    armor: 80,
    evasion: 50,
    accuracy: 150,
    attackDamage: 120,
    // 其他屬性自動使用預設值
    // criticalChance: 0.05 (預設)
    // criticalMultiplier: 1.5 (預設)
  }),
})
```

---

## 📊 數值驗證表

### 護甲減免率（K = 100）

| 護甲值 | 減免率 | 備註         |
| ------ | ------ | ------------ |
| 0      | 0%     | 無護甲       |
| 50     | 33.3%  | 低護甲       |
| 100    | 50%    | 平衡點       |
| 200    | 66.7%  | 高護甲       |
| 400    | 80%    | 極高護甲     |
| 600    | 85.7%  | 業主期望上限 |
| 900    | 90%    | 系統硬上限   |

### 閃避率範例

| 閃避值 | 命中值 | 基礎閃避率 | 備註               |
| ------ | ------ | ---------- | ------------------ |
| 100    | 100    | 5%         | 最小值（相等時）   |
| 200    | 100    | 100% → 80% | 達到上限           |
| 150    | 100    | 50%        | 平衡               |
| 50     | 150    | 5%         | 最小值（命中壓制） |
| 1000   | 0      | 80%        | 極端情況（上限）   |

### 能量獲取速度

```
場景：攻擊速度 1 秒/次 (100 tick)

每秒獲得能量 = 普攻 3 點 + 自然回復 1 點 = 4 點
達到 100 能量所需時間 = 100 / 4 = 25 秒
```

---

## ⚠️ 風險評估

| 風險                   | 等級  | 影響     | 緩解措施                 |
| ---------------------- | ----- | -------- | ------------------------ |
| 公式變更導致平衡性崩潰 | 🔴 高 | 戰鬥體驗 | 在測試環境充分驗證       |
| 破壞現有代碼           | 🟡 中 | 開發進度 | 分階段實施，保留向後兼容 |
| 閃避係數系統 Bug       | 🟡 中 | 遊戲體驗 | 先在分支實作並測試       |
| 屬性驗證過於嚴格       | 🟢 低 | 靈活性   | 提供配置開關             |

---

## 📝 行動計畫

### v0.3 版本（必做）

- [x] ✅ Step 1: 建立配置層
- [x] ✅ Step 2: 重構傷害計算公式
- [x] ✅ Step 3: 加入屬性驗證

### v0.4 版本（建議）

- [ ] ⏳ Step 4: 引入閃避係數系統
- [ ] ⏳ Step 5: 完善屬性定義

### v0.5 版本（可選）

- [ ] 📊 數值平衡調整（根據測試數據）
- [ ] 📊 配置熱更新系統（允許不重啟調整參數）

---

## 🎓 技術債務說明

### 為什麼不一次性完成？

1. **降低風險**: 分階段實施可及早發現問題
2. **保持穩定**: 每個版本都是可交付的穩定狀態
3. **靈活調整**: 根據測試反饋調整方案

### 未來優化方向

1. **動態配置系統**: 允許透過 JSON 修改遊戲數值
2. **A/B 測試**: 支援不同公式版本的對比測試
3. **數值模擬器**: 建立工具驗證屬性組合的平衡性

---

## 📚 參考資料

- [遊戲平衡設計原則](https://www.gamedeveloper.com/design/game-balance-concepts)
- [屬性系統設計模式](https://gameprogrammingpatterns.com/component.html)
- [SOLID 原則在遊戲開發中的應用](https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/solid-principles-in-game-development-r5977/)

---

**文件版本**: v1.0  
**最後更新**: 2025-12-01  
**審查者**: Tech Lead, Game Designer  
**下次審查**: v0.3 測試完成後
