import type {
  EffectModifier,
  EffectType,
  HolyFireConfig,
  PoisonConfig,
  ChillConfig,
  ChargeConfig,
  BlindConfig,
} from './effect.type'
import type { Effect } from './effect.model'
/**
 * 效果配置庫 - 存儲所有效果的默認配置
 */
export const EFFECT_CONFIGS = {
  holyFire: {
    healTickInterval: 1000,
    healPercentMap: {
      10: 0.02,
      20: 0.04,
      30: 0.04,
      40: 0.06,
      50: 0.06,
    },
    damageBoostPercentMap: {
      30: 0.1,
      40: 0.1,
      50: 0.1,
    },
    maxHpIncreasePercentMap: {
      50: 0.01,
    },
  } as HolyFireConfig,
  poison: {
    damagePerLayerPerTick: 1,
    durationTicks: 10000,
  } as PoisonConfig,
  chill: {
    attackSpeedReductionPercent: 0.04,
    durationTicks: 4000,
    maxLayers: 16,
  } as ChillConfig,
  charge: {
    attackSpeedBoostPercent: 0.04,
    durationTicks: 4000,
    maxLayers: 16,
  } as ChargeConfig,
  blind: {
    baseAccuracyReductionPercent: 0.5,
    durationTicks: 4000,
    canStack: false,
  } as BlindConfig,
} as const
/**
 * 效果計算器 - 計算效果對屬性的修飾
 */
export class EffectCalculator {
  /**
   * 計算聖火效果的修飾
   */
  static calculateHolyFireModifier(totalLayers: number, config: HolyFireConfig): Partial<EffectModifier> {
    const modifier: Partial<EffectModifier> = {
      hpHealPercent: 0,
      damageBoostByType: {},
      maxHpIncreasePercent: 0,
    }
    if (totalLayers >= 50) {
      modifier.hpHealPercent = config.healPercentMap[50] ?? 0
      modifier.damageBoostByType!['fire'] = config.damageBoostPercentMap[50] ?? 0
      modifier.maxHpIncreasePercent = config.maxHpIncreasePercentMap[50] ?? 0
    } else if (totalLayers >= 40) {
      modifier.hpHealPercent = config.healPercentMap[40] ?? 0
      modifier.damageBoostByType!['fire'] = config.damageBoostPercentMap[40] ?? 0
    } else if (totalLayers >= 30) {
      modifier.hpHealPercent = config.healPercentMap[30] ?? 0
      modifier.damageBoostByType!['fire'] = config.damageBoostPercentMap[30] ?? 0
    } else if (totalLayers >= 20) {
      modifier.hpHealPercent = config.healPercentMap[20] ?? 0
    } else if (totalLayers >= 10) {
      modifier.hpHealPercent = config.healPercentMap[10] ?? 0
    }
    return modifier
  }
  /**
   * 計算中毒效果的傷害
   */
  static calculatePoisonDamage(totalLayers: number, config: PoisonConfig): number {
    return totalLayers * config.damagePerLayerPerTick
  }
  /**
   * 計算冰緩效果的修飾
   */
  static calculateChillModifier(totalLayers: number, config: ChillConfig): Partial<EffectModifier> {
    return {
      attackSpeedPercent: -config.attackSpeedReductionPercent * totalLayers,
    }
  }
  /**
   * 計算充能效果的修飾
   */
  static calculateChargeModifier(totalLayers: number, config: ChargeConfig): Partial<EffectModifier> {
    return {
      attackSpeedPercent: config.attackSpeedBoostPercent * totalLayers,
    }
  }
  /**
   * 計算致盲效果的修飾
   */
  static calculateBlindModifier(hasBlind: boolean, config: BlindConfig): Partial<EffectModifier> {
    return {
      accuracyReduction: hasBlind ? config.baseAccuracyReductionPercent : 0,
    }
  }
  /**
   * 從效果列表計算總修飾
   */
  static calculateTotalModifier(effects: Effect[]): EffectModifier {
    const modifier: EffectModifier = {
      hpHealPercent: 0,
      attackSpeedPercent: 0,
      damageBoostByType: {},
      accuracyReduction: 0,
      maxHpIncreasePercent: 0,
    }
    // 按效果類型分組
    const effectsByType = new Map<EffectType, Effect[]>()
    for (const effect of effects) {
      if (!effectsByType.has(effect.type)) {
        effectsByType.set(effect.type, [])
      }
      effectsByType.get(effect.type)!.push(effect)
    }
    // 計算各類型效果的修飾
    const holyFireEffects = effectsByType.get('holyFire') ?? []
    if (holyFireEffects.length > 0) {
      const totalLayers = holyFireEffects.reduce((sum, e) => sum + e.layers, 0)
      const holyFireModifier = this.calculateHolyFireModifier(totalLayers, EFFECT_CONFIGS.holyFire)
      Object.assign(modifier, holyFireModifier)
    }
    const chillEffects = effectsByType.get('chill') ?? []
    if (chillEffects.length > 0) {
      const totalLayers = chillEffects.reduce((sum, e) => sum + e.layers, 0)
      const chillModifier = this.calculateChillModifier(totalLayers, EFFECT_CONFIGS.chill)
      Object.assign(modifier, chillModifier)
    }
    const chargeEffects = effectsByType.get('charge') ?? []
    if (chargeEffects.length > 0) {
      const totalLayers = chargeEffects.reduce((sum, e) => sum + e.layers, 0)
      const chargeModifier = this.calculateChargeModifier(totalLayers, EFFECT_CONFIGS.charge)
      // 攻擊速度效果可以疊加：冷卻時間 = 基礎冷卻 / (1 + attackSpeedPercent)
      modifier.attackSpeedPercent += chargeModifier.attackSpeedPercent ?? 0
    }
    const blindEffects = effectsByType.get('blind') ?? []
    if (blindEffects.length > 0) {
      const blindModifier = this.calculateBlindModifier(true, EFFECT_CONFIGS.blind)
      Object.assign(modifier, blindModifier) // 將致盲修飾合並到總修飾中
    }
    // 合並傷害類型加成
    for (const effect of effects) {
      // 如果是聖火效果，且果然沒有火焰傷害加成，則初始化為 0
      if (effect.type === 'holyFire' && !modifier.damageBoostByType['fire']) {
        modifier.damageBoostByType['fire'] = 0
      }
    }
    return modifier
  }
}
