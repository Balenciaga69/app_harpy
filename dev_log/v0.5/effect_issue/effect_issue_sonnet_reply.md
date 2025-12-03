# 聖物特效與 Effect 修飾系統設計分析

## 🎯 核心問題解答

### Q1: 效果應該被修飾嗎?業界會這樣做嗎?

**✅ 是的,業界普遍使用修飾器模式處理這類問題**

業界常見做法:

- **Path of Exile**: 使用 Modifier Stack 系統
- **Slay the Spire**: 使用 Power/Relic Hook 系統
- **Hades**: 使用 Boon Modifier 系統

核心原則: **Effects 是數據層,Modifiers 是行為層**

---

## 🏗️ 推薦架構: Effect Modifier System

### 設計理念

```
[Relic/Equipment] → [EffectModifier] → [Effect Instance] → [Actual Behavior]
     外部來源          修飾行為層          效果數據層         最終表現
```

### 核心接口設計

```typescript
/**
 * Modifier that changes how an effect behaves
 * Applied by relics, equipment, or temporary buffs
 */
export interface IEffectModifier {
  /** Unique modifier ID */
  readonly id: string

  /** Source that applies this modifier (relic/equipment ID) */
  readonly sourceId: string

  /** Which effect type this modifier affects */
  readonly targetEffectType: string

  /** Modifier priority (higher = applied later) */
  readonly priority: number

  /** Modify damage output (for DoT effects) */
  modifyDamage?(baseDamage: number, context: IModifierContext): number

  /** Modify layer decay */
  modifyDecay?(baseDecay: number, context: IModifierContext): number

  /** Modify layer application */
  modifyLayerApplication?(baseLayers: number, context: IModifierContext): number

  /** Check if modifier should expire */
  shouldExpire?(context: IModifierContext): boolean

  /** Called when effect triggers */
  onEffectTrigger?(context: IModifierContext): void
}

/**
 * Context passed to modifiers
 */
export interface IModifierContext {
  /** Current combat context */
  combat: ICombatContext

  /** Target character ID */
  targetId: string

  /** Source character ID (who applied the effect) */
  sourceId?: string

  /** The effect being modified */
  effect: ILayeredEffect

  /** Additional metadata */
  metadata?: Record<string, unknown>
}
```

---

## 📦 Enhanced Effect Interface with Modifiers

```typescript
/**
 * Extended layered effect with modifier support
 */
export interface ILayeredEffect extends IEffect {
  readonly layers: number
  readonly maxLayers?: number
  readonly decayStrategy: ILayerDecayStrategy

  lastTriggerTick: number

  /** Modifiers affecting this effect */
  readonly modifiers: Map<string, IEffectModifier>

  addLayers(amount: number): void
  applyDecay(currentTick: number): void
  onLayerChange?(targetId: string, context: ICombatContext): void

  /** Add a modifier to this effect */
  addModifier(modifier: IEffectModifier): void

  /** Remove a modifier from this effect */
  removeModifier(modifierId: string): void

  /** Calculate final damage with all modifiers applied */
  calculateModifiedDamage(baseDamage: number, context: IModifierContext): number

  /** Calculate final decay with all modifiers applied */
  calculateModifiedDecay(baseDecay: number, context: IModifierContext): number
}
```

---

## 🎮 實戰範例: 聖物特效實作

### 範例 1: Poison 傷害 x2 詛咒 (觸發 3 次後消失)

```typescript
/**
 * Relic: Curse of Poison
 * When applied: Enemy poison damage x2, expires after 3 triggers
 */
export class CurseOfPoisonRelic implements IRelic {
  readonly id: string
  readonly name = 'Curse of Poison'

  private curseModifierId?: string

  onApply(ownerId: string, context: ICombatContext): void {
    // Listen for when owner applies poison to enemy
    context.eventBus.on('effect:applied', (event) => {
      if (event.sourceId === ownerId && event.effectName === 'POISON') {
        this.applyCurse(event.targetId, context)
      }
    })
  }

  private applyCurse(targetId: string, context: ICombatContext): void {
    const target = context.registry.getCharacter(targetId)
    if (!target) return

    // Create curse modifier
    this.curseModifierId = generateId()
    const curseModifier = new PoisonCurseModifier(
      this.curseModifierId,
      this.id,
      3 // Max triggers
    )

    // Find poison effect on target
    const poisonEffect = target.effects.findEffectByName('POISON')
    if (poisonEffect && 'addModifier' in poisonEffect) {
      ;(poisonEffect as ILayeredEffect).addModifier(curseModifier)
    }

    // Emit curse event for visual feedback
    context.eventBus.emit('relic:curse-applied', {
      relicId: this.id,
      targetId,
      curseType: 'POISON_DAMAGE_BOOST',
    })
  }
}

/**
 * Modifier that doubles poison damage for 3 triggers
 */
class PoisonCurseModifier implements IEffectModifier {
  readonly priority = 100
  readonly targetEffectType = 'POISON'

  private triggerCount = 0

  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    private readonly maxTriggers: number
  ) {}

  modifyDamage(baseDamage: number, context: IModifierContext): number {
    return baseDamage * 2
  }

  onEffectTrigger(context: IModifierContext): void {
    this.triggerCount++

    // Emit trigger count event for UI
    context.combat.eventBus.emit('modifier:triggered', {
      modifierId: this.id,
      triggerCount: this.triggerCount,
      maxTriggers: this.maxTriggers,
    })
  }

  shouldExpire(context: IModifierContext): boolean {
    return this.triggerCount >= this.maxTriggers
  }
}
```

### 範例 2: Chill 不會遞減 + 造成 Poison

```typescript
/**
 * Relic: Frozen Venom
 * Self chill won't decay for X ticks, and chill applied to enemies also applies poison
 */
export class FrozenVenomRelic implements IRelic {
  readonly id: string
  readonly name = 'Frozen Venom'

  private readonly noDecayDuration = 500 // 5 seconds
  private activationTick = 0

  onApply(ownerId: string, context: ICombatContext): void {
    this.activationTick = context.currentTick

    // Part 1: Self chill won't decay
    context.eventBus.on('effect:applied', (event) => {
      if (event.targetId === ownerId && event.effectName === 'CHILL') {
        this.applyNoDecayModifier(ownerId, context)
      }
    })

    // Part 2: Chill on enemies also applies poison
    context.eventBus.on('effect:applied', (event) => {
      if (event.sourceId === ownerId && event.effectName === 'CHILL') {
        this.applyPoisonSideEffect(event.targetId, context)
      }
    })
  }

  private applyNoDecayModifier(targetId: string, context: ICombatContext): void {
    const self = context.registry.getCharacter(targetId)
    if (!self) return

    const chillEffect = self.effects.findEffectByName('CHILL')
    if (chillEffect && 'addModifier' in chillEffect) {
      const modifier = new NoDecayModifier(generateId(), this.id, this.activationTick + this.noDecayDuration)(
        chillEffect as ILayeredEffect
      ).addModifier(modifier)
    }
  }

  private applyPoisonSideEffect(targetId: string, context: ICombatContext): void {
    const target = context.registry.getCharacter(targetId)
    if (!target) return

    // Calculate poison layers based on chill layers applied
    const chillEffect = target.effects.findEffectByName('CHILL')
    if (chillEffect && 'layers' in chillEffect) {
      const poisonLayers = Math.floor((chillEffect as ILayeredEffect).layers * 0.5)

      // Apply poison
      target.effects.applyEffect('POISON', poisonLayers, context)
    }
  }
}

/**
 * Modifier that prevents decay until expiration tick
 */
class NoDecayModifier implements IEffectModifier {
  readonly priority = 200 // High priority to override decay
  readonly targetEffectType = 'CHILL'

  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    private readonly expirationTick: number
  ) {}

  modifyDecay(baseDecay: number, context: IModifierContext): number {
    // Block all decay
    return 0
  }

  shouldExpire(context: IModifierContext): boolean {
    return context.combat.currentTick >= this.expirationTick
  }
}
```

---

## 🔧 Base Implementation with Modifier Support

```typescript
/**
 * Base implementation with full modifier support
 */
export abstract class BaseLayeredEffect implements ILayeredEffect {
  private _layers: number = 0
  public lastTriggerTick: number = 0
  public readonly modifiers = new Map<string, IEffectModifier>()

  // ...existing code...

  addModifier(modifier: IEffectModifier): void {
    this.modifiers.set(modifier.id, modifier)
  }

  removeModifier(modifierId: string): void {
    this.modifiers.delete(modifierId)
  }

  calculateModifiedDamage(baseDamage: number, context: IModifierContext): number {
    let finalDamage = baseDamage

    // Apply all damage modifiers in priority order
    const sortedModifiers = Array.from(this.modifiers.values())
      .filter((m) => m.modifyDamage !== undefined)
      .sort((a, b) => a.priority - b.priority)

    for (const modifier of sortedModifiers) {
      if (modifier.modifyDamage) {
        finalDamage = modifier.modifyDamage(finalDamage, context)
      }
    }

    return finalDamage
  }

  calculateModifiedDecay(baseDecay: number, context: IModifierContext): number {
    let finalDecay = baseDecay

    // Apply all decay modifiers in priority order
    const sortedModifiers = Array.from(this.modifiers.values())
      .filter((m) => m.modifyDecay !== undefined)
      .sort((a, b) => a.priority - b.priority)

    for (const modifier of sortedModifiers) {
      if (modifier.modifyDecay) {
        finalDecay = modifier.modifyDecay(finalDecay, context)
      }
    }

    return finalDecay
  }

  applyDecay(currentTick: number): void {
    const baseDecay = this.decayStrategy.calculateDecay(this._layers, currentTick, this.lastTriggerTick)

    // Calculate final decay with modifiers
    const context: IModifierContext = {
      combat: this.getCombatContext(), // Need to inject this
      targetId: this.getOwnerId(), // Need to inject this
      effect: this,
    }

    const finalDecay = this.calculateModifiedDecay(baseDecay, context)

    if (finalDecay > 0) {
      this._layers = Math.max(0, this._layers - finalDecay)
    }

    // Clean up expired modifiers
    this.cleanupExpiredModifiers(context)
  }

  private cleanupExpiredModifiers(context: IModifierContext): void {
    const toRemove: string[] = []

    this.modifiers.forEach((modifier, id) => {
      if (modifier.shouldExpire?.(context)) {
        toRemove.push(id)
      }
    })

    toRemove.forEach((id) => this.removeModifier(id))
  }

  // Subclasses need to provide context access
  protected abstract getCombatContext(): ICombatContext
  protected abstract getOwnerId(): string
}
```

---

## 🎯 回答您的問題

### Q2: 單實例設計會讓聖物特效難以實作嗎?

**❌ 不會,反而更簡單**

理由:

1. **單一目標**: 修飾器只需要找到一個效果實例,而非多個
2. **狀態集中**: 所有層數都在一個實例,修飾器邏輯更清晰
3. **事件驅動**: 透過 EventBus 監聽效果變化,聖物邏輯解耦

對比多實例的問題:

- 需要遍歷所有同類型實例
- 修飾器要決定影響哪些實例
- 層數分散,計算複雜

### Q3: 會影響其他功能嗎?

**✅ 不會影響,完全解耦**

隔離層級:

```
┌─────────────────────────────────────┐
│   Relic/Equipment (外部系統)         │
│   ↓ 透過 EventBus 監聽              │
│   IEffectModifier (修飾行為)         │
│   ↓ 修改                            │
│   ILayeredEffect (效果數據)          │
│   ↓ 使用                            │
│   AttributeModifier (屬性修正)       │
│   ↓ 影響                            │
│   DamageChain (傷害計算)             │
└─────────────────────────────────────┘
```

影響範圍:

- ✅ **協跳系統**: 完全不受影響,仍透過 TickActionSystem 驅動
- ✅ **DamageChain**: 不受影響,只關心最終屬性值
- ✅ **AttributeContainer**: 不受影響,效果透過 Modifier 注入
- ⚠️ **僅 Effect 內部邏輯變更**: 加入 Modifier 支援

---

## 📈 業界最佳實踐對比

| 遊戲               | 做法                                | 適用場景                 |
| ------------------ | ----------------------------------- | ------------------------ |
| **Path of Exile**  | Modifier Stack + Calculation Engine | 極複雜數值系統           |
| **Slay the Spire** | Power Hook + Relic Subscriber       | 卡牌策略遊戲             |
| **Hades**          | Boon Modifier + Status Priority     | 動作 Roguelike           |
| **您的專案**       | Effect Modifier + Event-Driven      | **輕量 Auto-battler** ✅ |

推薦理由:

- 輕量但足夠靈活
- 事件驅動,解耦良好
- 易於擴展新聖物
- 符合 SOLID 原則

---

## 🎉 總結建議

✅ **採用 Effect Modifier 系統**

- 輕量級實作,不過度設計
- 完全解耦,不影響現有功能
- 支援複雜聖物特效

✅ **保持單實例+層數設計**

- 更易於修飾
- 效能更好
- 邏輯更清晰

✅ **透過 EventBus 驅動**

- 聖物監聽效果事件
- 動態添加/移除修飾器
- 完全解耦
