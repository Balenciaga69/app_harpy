import type { CombatContext } from '../../context/combat.context'
import type { DamageEvent, ElementalDamages } from '../../damage/models/damage.event.model'
import type { IEffect } from '../../effect/models/effect.model'
import { ChillEffect, ChargeEffect, HolyFireEffect, PoisonEffect } from '../../effect/Implementation'
/**
 * 元素效果配置
 */
interface ElementEffectConfig {
  damageType: keyof ElementalDamages
  effectFactory: () => IEffect
}
/**
 * ElementEffectRegistry：元素效果配置註冊表。
 *
 * 設計理念：
 * - 採用註冊表模式實現數據驅動的元素效果施加機制。
 * - 將元素類型與對應效果的映射關係配置化，避免硬編碼在業務邏輯中。
 * - 支援運行時動態註冊新的元素效果，提供高度的擴展性。
 * - 使用工廠函數創建效果實例，確保每次施加都是全新的效果物件。
 * - 支援機率觸發機制，可為不同元素設定不同的生效概率。
 *
 * 主要職責：
 * - 維護元素類型（fire、ice、lightning、poison）與效果類的映射關係。
 * - 根據 DamageEvent 中的傷害分配自動判斷應施加哪些效果。
 * - 使用 CombatContext 的隨機數生成器進行機率判定。
 * - 透過 effectFactory 創建效果實例並添加到目標角色身上。
 * - 提供 registerEffect 方法支援擴展新的元素效果類型。
 * - 檢查傷害是否命中與是否被阻擋，避免對無效傷害施加效果。
 */
export class ElementEffectRegistry {
  private registry: Map<string, ElementEffectConfig> = new Map([
    [
      'fire',
      {
        damageType: 'fire',
        effectFactory: () => new HolyFireEffect(),
      },
    ],
    [
      'ice',
      {
        damageType: 'ice',
        effectFactory: () => new ChillEffect(),
      },
    ],
    [
      'lightning',
      {
        damageType: 'lightning',
        effectFactory: () => new ChargeEffect(),
      },
    ],
    [
      'poison',
      {
        damageType: 'poison',
        effectFactory: () => new PoisonEffect(),
      },
    ],
  ])
  /**
   * 根據傷害事件施加對應的元素效果
   */
  applyEffects(damageEvent: DamageEvent, context: CombatContext): void {
    if (!damageEvent.isHit || damageEvent.prevented) return
    for (const [_name, config] of this.registry) {
      const damageAmount = damageEvent.damages[config.damageType]
      if (damageAmount > 0) {
        const effect = config.effectFactory()
        damageEvent.target.addEffect(effect, context)
      }
    }
  }
  /**
   * 註冊新的元素效果（可選）
   */
  registerEffect(name: string, config: ElementEffectConfig): void {
    this.registry.set(name, config)
  }
}
