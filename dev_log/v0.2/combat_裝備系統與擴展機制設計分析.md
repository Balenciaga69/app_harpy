# Combat 模組：裝備系統與擴展機制設計分析

> **分析日期**: 2025-12-01  
> **分析目標**: 評估如何讓裝備、大絕招、聖物等元件改變傷害與異常狀態計算邏輯，並優化現有架構

---

## 📋 問題概述

### 問題 1: 可擴展性需求

**需求**: 能夠使用裝備、大絕招、聖物、裝備特效等來改變傷害與狀態與異常狀態計算邏輯

**現況分析**:

- 目前已有 `ICombatHook` 介面，允許在傷害計算的 7 個階段插入自定義邏輯
- 已有實作範例：`ChargedCriticalEffect`（裝備特效）、`LowHealthArmorEffect`（裝備特效）
- 這些特效透過實作 `IEffect` 和 `ICombatHook` 雙介面來達成

### 問題 2: 組織架構疑慮

**困惑**: 大絕招放在 `coordination/models/`，效果放在 `domain/effect/`，兩個資料夾在定義層次上不同

**現況分析**:

- `IUltimateAbility` 位於 `coordination` 層（第 5 層：協調層）
- `IEffect` 位於 `domain` 層（第 3 層：數據模型層）
- `ICombatHook` 位於 `logic` 層（第 4 層：業務邏輯層）

---

## 🎯 核心設計理念

### 遊戲設計角度：Item = 遺物的本質

根據你的設計文件：

> "其實本質上都是遺物(Items)，只不過遺物可以無限堆疊，但裝備武器只能裝備一個。"

這個理念暗示了：

1. **武器、頭盔、項鍊** 都是特殊的遺物（單例限制）
2. **遺物** 可以無限堆疊（數量限制）
3. 它們本質上都是 **效果的容器** (Effect Container)

### 技術實作角度：三種擴展介面的職責

| 介面               | 作用範疇           | 生命週期     | 觸發時機       |
| :----------------- | :----------------- | :----------- | :------------- |
| `IEffect`          | 狀態管理、屬性修改 | 持續/週期    | onApply/onTick |
| `ICombatHook`      | 傷害計算流程干預   | 單次傷害事件 | 傷害計算各階段 |
| `IUltimateAbility` | 主動技能行為       | 主動觸發     | 能量滿時執行   |

---

## 🏗️ 解決方案 A：統一的 Item 系統（推薦）

### 設計思路

建立一個新的 `domain/item/` 模組，作為所有裝備、遺物的統一抽象層。

```
combat/
  domain/
    item/                        # 新增：物品系統（統一管理層）
      models/
        item.interface.ts        # 物品介面
        equipment.model.ts       # 裝備基類（武器、裝甲等）
        relic.model.ts           # 遺物基類（可堆疊）
        item.slot.enum.ts        # 裝備槽位 (Weapon/Helmet/Armor/Necklace)
      registry/
        item.registry.ts         # 物品註冊表（ID -> Item 實例）
      index.ts
    effect/                      # 保持現有結構
      models/
        effect.interface.ts
        stackable.effect.model.ts
      Implementation/
        Equipment/               # 裝備特效實作
        NativeStatus/            # 原生異常狀態
        Relic/                   # 新增：遺物特效實作
      index.ts
    character/
      # 保持現有結構
  coordination/
    ability/                     # 重命名：ability -> ability-system
      ultimate/                  # 新增子目錄：大招實作
        simple.damage.ultimate.ts
        thunder.strike.ultimate.ts
      models/
        ultimate.ability.interface.ts
      index.ts
```

### 核心概念

#### 1. Item 介面設計

```typescript
/**
 * Item interface - unified abstraction for all equipment and relics
 *
 * Design concept:
 * - All items (weapons, armor, relics) implement this interface
 * - Items can provide multiple effects
 * - Items can be upgraded (future feature)
 */
export interface IItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ItemRarity // Common, Rare, Epic, Legendary
  readonly slot?: ItemSlot // Only equipment has slot restriction

  /** Get all effects this item provides */
  getEffects(): IEffect[]

  /** Upgrade item (future feature) */
  upgrade?(): void
}

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type ItemSlot = 'weapon' | 'helmet' | 'armor' | 'necklace'
```

#### 2. Equipment 基類

```typescript
/**
 * Equipment base class
 * Represents unique-slot items (can only equip one per slot)
 */
export abstract class Equipment implements IItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ItemRarity
  readonly slot: ItemSlot

  protected effects: IEffect[] = []

  constructor(config: EquipmentConfig) {
    this.id = config.id ?? `equipment-${nanoid(6)}`
    this.name = config.name
    this.description = config.description
    this.rarity = config.rarity
    this.slot = config.slot
    this.initializeEffects()
  }

  /** Initialize effects provided by this equipment */
  protected abstract initializeEffects(): void

  getEffects(): IEffect[] {
    return this.effects
  }
}
```

#### 3. Relic 基類

```typescript
/**
 * Relic base class
 * Represents stackable items (can own multiple)
 */
export abstract class Relic implements IItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ItemRarity
  readonly slot = undefined // Relics don't occupy equipment slots

  protected effects: IEffect[] = []
  private stackCount: number = 1

  constructor(config: RelicConfig) {
    this.id = config.id ?? `relic-${nanoid(6)}`
    this.name = config.name
    this.description = config.description
    this.rarity = config.rarity
    this.initializeEffects()
  }

  protected abstract initializeEffects(): void

  getEffects(): IEffect[] {
    return this.effects
  }

  /** Get stack count */
  getStackCount(): number {
    return this.stackCount
  }

  /** Add stacks */
  addStack(): void {
    this.stackCount++
    this.onStackChanged()
  }

  /** Handle stack count changes (e.g., refresh effects) */
  protected abstract onStackChanged(): void
}
```

### 實例範例

#### 範例 1：充能暴擊武器（Equipment）

```typescript
/**
 * Charged Critical Weapon
 *
 * Equipment effect:
 * - When wielder has charge, critical chance doubles
 */
export class ChargedCriticalWeapon extends Equipment {
  constructor() {
    super({
      name: 'Stormblade',
      description: 'Doubles critical chance when charged',
      rarity: 'epic',
      slot: 'weapon',
    })
  }

  protected initializeEffects(): void {
    // Add base attack damage modifier
    this.effects.push(new BaseAttackDamageEffect(50))

    // Add charged critical hook effect
    this.effects.push(new ChargedCriticalEffect())
  }
}
```

#### 範例 2：低血護甲遺物（Relic）

```typescript
/**
 * Iron Will Relic
 *
 * Stackable relic:
 * - Gain +20% armor when below 30% HP
 * - Each stack increases armor bonus by 10%
 */
export class IronWillRelic extends Relic {
  constructor() {
    super({
      name: 'Iron Will',
      description: 'Gain armor when low on health',
      rarity: 'rare',
    })
  }

  protected initializeEffects(): void {
    this.effects.push(new LowHealthArmorEffect(this.getStackCount()))
  }

  protected onStackChanged(): void {
    // Refresh effects with new stack count
    this.effects = []
    this.initializeEffects()
  }
}
```

---

## 🏗️ 解決方案 B：保持現狀，優化組織（保守方案）

如果不想大幅重構，可以採取以下優化：

### 1. 將 Ultimate 移到獨立模組

```
coordination/
  ability-system/              # 重命名
    ability.system.ts
    ultimate/                  # 新增：大招實作專用目錄
      simple.damage.ultimate.ts
      thunder.strike.ultimate.ts
      models/
        ultimate.ability.interface.ts
    target-select-strategies/
    factories/
```

### 2. Effect 分類更清晰

```
domain/
  effect/
    models/
      effect.interface.ts
      stackable.effect.model.ts
    implementations/           # 重命名：Implementation -> implementations
      equipment/               # 裝備特效
      status/                  # 重命名：NativeStatus -> status（異常狀態）
      relic/                   # 新增：遺物特效
```

### 3. 建立清晰的命名規範

- **裝備特效**: `XXXEquipmentEffect`（如 `ChargedCriticalEquipmentEffect`）
- **異常狀態**: `XXXStatusEffect`（如 `PoisonStatusEffect`）
- **遺物特效**: `XXXRelicEffect`（如 `IronWillRelicEffect`）
- **大招**: `XXXUltimate`（如 `ThunderStrikeUltimate`）

---

## 📊 方案對比

| 方案       | 優點                                                                                            | 缺點                                   | 適用場景               |
| :--------- | :---------------------------------------------------------------------------------------------- | :------------------------------------- | :--------------------- |
| **方案 A** | ✅ 符合「Item = 遺物」的遊戲設計<br>✅ 統一管理入口<br>✅ 易於實作升級系統<br>✅ 清晰的職責分層 | ⚠️ 需要新建模組<br>⚠️ 需要遷移部分代碼 | 長期維護、系統複雜度高 |
| **方案 B** | ✅ 改動最小<br>✅ 保持現有架構                                                                  | ⚠️ 概念仍然分散<br>⚠️ 未來擴展受限     | 短期快速開發、試錯階段 |

---

## 🎯 具體實作建議（基於方案 A）

### Phase 1: 建立 Item 抽象層（1-2 天）

1. 新建 `domain/item/` 模組
2. 定義 `IItem`, `Equipment`, `Relic` 基類
3. 編寫 2-3 個範例實作（如上述的 `ChargedCriticalWeapon`）

### Phase 2: 遷移現有 Effect（1 天）

1. 將 `ChargedCriticalEffect` 重構為 `ChargedCriticalWeapon` 的一部分
2. 將 `LowHealthArmorEffect` 重構為 `IronWillRelic` 的一部分

### Phase 3: 整合 Ultimate 系統（1 天）

1. 思考：大招是否也是一種 Item？
   - **選項 A**: 大招是獨立系統（現狀維持）
   - **選項 B**: 大招是角色的「內建技能書」（可視為特殊 Item）
2. 如果選擇 B，可以定義 `SkillBook extends Item`

### Phase 4: Character 裝備管理（1-2 天）

在 `Character` 中新增：

```typescript
export class Character implements ICharacter {
  // ...existing code...

  private equippedItems: Map<ItemSlot, Equipment> = new Map()
  private relics: Relic[] = []

  /** Equip an item */
  equipItem(item: Equipment, context: CombatContext): void {
    // Remove old item in same slot
    const oldItem = this.equippedItems.get(item.slot)
    if (oldItem) {
      this.unequipItem(item.slot, context)
    }

    // Equip new item
    this.equippedItems.set(item.slot, item)

    // Apply all effects from this item
    item.getEffects().forEach((effect) => {
      this.applyEffect(effect, context)
    })
  }

  /** Add a relic */
  addRelic(relic: Relic, context: CombatContext): void {
    this.relics.push(relic)
    relic.getEffects().forEach((effect) => {
      this.applyEffect(effect, context)
    })
  }

  /** Get all item effects (for hook collection) */
  private getAllItemEffects(): IEffect[] {
    const equipmentEffects = Array.from(this.equippedItems.values()).flatMap((item) => item.getEffects())
    const relicEffects = this.relics.flatMap((relic) => relic.getEffects())
    return [...equipmentEffects, ...relicEffects]
  }
}
```

---

## 🔍 關於組織架構的深入思考

### 為什麼會感覺「怪」？

你的直覺是對的。問題在於：

1. **`IUltimateAbility` 在 coordination 層**
   - Coordination 是「協調者」，應該協調已有的模組
   - 但 Ultimate 的具體實作（`SimpleDamageUltimate`）也在這層
   - 這導致「介面定義」和「業務實作」混在同一層

2. **`IEffect` 在 domain 層**
   - Domain 是「領域模型」，定義核心業務概念
   - Effect 的實作（`ChargedCriticalEffect`）也在這層
   - 這是合理的，因為 Effect 是核心領域概念

3. **`ICombatHook` 在 logic 層**
   - Logic 是「業務邏輯」，處理計算流程
   - Hook 是流程擴展點，定義在這裡合理
   - 但實作 Hook 的類（如 `ChargedCriticalEffect`）卻在 domain 層

### 層級混亂的根本原因

**問題**: 三個介面分散在三個不同層級，但它們常常被同一個類同時實作。

**解決思路**: 建立一個 **共享契約層 (Shared Contracts)**

```
combat/
  shared/                      # 第 0 層：共享層
    interfaces/
      entity.interface.ts
      combat.hook.interface.ts    # 移到這裡
      effect.interface.ts         # 移到這裡（或保持在 domain）
      ultimate.ability.interface.ts  # 移到這裡
    models/
      # ...existing code...
```

**優點**:

- 所有契約（介面）都在最底層，被上層依賴
- 實作類可以自由選擇在 domain 或 coordination 實作
- 避免循環依賴

**缺點**:

- 違反了「介面應該靠近使用者」的原則
- 可能導致 shared 層過於臃腫

---

## 💡 我的最終建議

### 短期（v0.3 開發階段）

採用 **方案 B + 命名規範優化**：

1. 保持現有架構，專注實作能量系統和大招邏輯
2. 統一命名規範（`XXXEquipmentEffect`, `XXXUltimate` 等）
3. 將 `coordination/models/` 改為 `coordination/ability-system/ultimate/`

### 中長期（v0.4+ 或正式版前）

採用 **方案 A + 共享契約層**：

1. 建立 `domain/item/` 統一管理裝備與遺物
2. 將 `ICombatHook` 和 `IUltimateAbility` 移到 `shared/interfaces/`
3. 保持 `IEffect` 在 `domain/effect/models/`（因為它是核心領域概念）

### 關於大招的定位

**建議**: 大招不應該是 Item 的一部分

**理由**:

1. 大招是角色的「內建能力」，不可更換（至少在你目前的設計中）
2. 大招的觸發機制依賴能量系統，與裝備邏輯分離
3. 未來可能會有「替換大招」的需求，但那是另一個系統（技能書系統）

**推薦組織**:

```
coordination/
  ability-system/
    ability.system.ts          # 協調者：處理普攻與大招觸發
    ultimate/                  # 大招實作目錄
      base.ultimate.ts         # 大招基類（可選）
      simple.damage.ultimate.ts
      thunder.strike.ultimate.ts
      healing.wave.ultimate.ts
    models/
      ultimate.ability.interface.ts
```

---

## ✅ 檢查清單（實作時參考）

### 如果採用方案 A

- [ ] 新建 `domain/item/` 模組
- [ ] 定義 `IItem`, `Equipment`, `Relic` 介面/基類
- [ ] 將現有的 `ChargedCriticalEffect` 改為裝備的一部分
- [ ] 將現有的 `LowHealthArmorEffect` 改為遺物的一部分
- [ ] 在 `Character` 中新增 `equipItem()` 和 `addRelic()` 方法
- [ ] 更新 `hookCollector.util.ts` 以收集來自 Item 的 Hook
- [ ] 撰寫單元測試
- [ ] 更新文檔

### 如果採用方案 B

- [ ] 重組目錄結構（`coordination/ability-system/ultimate/`）
- [ ] 統一命名規範（`XXXEquipmentEffect`, `XXXStatusEffect`）
- [ ] 在每個 Effect 的註解中標註其用途（裝備/異常/遺物）
- [ ] 更新 `combat_架構介紹.md` 文檔

---

## 🔚 總結

1. **可擴展性問題已有解**: 現有的 `ICombatHook` 已經提供了足夠的擴展能力，只需要建立更好的組織結構。

2. **組織架構問題的本質**: 三種介面（`IEffect`, `ICombatHook`, `IUltimateAbility`）分散在不同層級，但經常被同時實作，導致概念混亂。

3. **推薦路徑**:
   - **立即**: 採用方案 B，優化目錄結構和命名
   - **未來**: 採用方案 A，建立統一的 Item 系統

4. **大招的定位**: 應該保持在 `coordination/ability-system/` 而非歸入 Item 系統，因為它是角色的內建能力，不是可裝備的物品。

希望這份分析能幫助你做出決策！有任何疑問都可以繼續討論。
