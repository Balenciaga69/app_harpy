import type { AttributeType } from '@/domain/attribute'
import type { IEffect } from '../models/effect'
import { InvalidStaticEffectError } from '../errors'
import { StaticAttributeEffect } from '../models/static-attribute-effect'
/**
 * 靜態效果生成器
 *
 * 負責處理 effect_static_* 類型的效果模板。
 * 根據模板 ID 解析屬性類型，使用詞綴實例的數值生成輕量級效果。
 *
 * 支援的格式：
 * - effect_static_attack_power
 * - effect_static_max_hp
 * - effect_static_critical_chance
 * - effect_static_armor
 * - effect_static_evasion
 * - etc.
 */
export class StaticEffectGenerator {
  private static readonly PREFIX = 'effect_static_'
  /**
   * 屬性類型映射表
   *
   * 將 effect_static_* 的後綴映射到 AttributeType。
   */
  private static readonly ATTRIBUTE_MAP: Record<string, AttributeType> = {
    attack_damage: 'attackDamage',
    max_hp: 'maxHp',
    critical_chance: 'criticalChance',
    critical_multiplier: 'criticalMultiplier',
    armor: 'armor',
    evasion: 'evasion',
    accuracy: 'accuracy',
    energy_regen: 'energyRegen',
    energy_gain_on_attack: 'energyGainOnAttack',
    resurrection_chance: 'resurrectionChance',
    attack_cooldown: 'attackCooldown',
    // 未來可擴展更多映射
  }
  /**
   * 顯示名稱映射表
   */
  private static readonly DISPLAY_NAME_MAP: Record<string, string> = {
    attack_damage: 'Attack Damage',
    max_hp: 'Max HP',
    critical_chance: 'Critical Chance',
    critical_multiplier: 'Critical Multiplier',
    armor: 'Armor',
    evasion: 'Evasion',
    accuracy: 'Accuracy',
    energy_regen: 'Energy Regen',
    energy_gain_on_attack: 'Energy on Attack',
    resurrection_chance: 'Resurrection Chance',
    attack_cooldown: 'Attack Cooldown',
  }
  /**
   * 檢查是否為靜態效果模板
   */
  static isStaticEffect(templateId: string): boolean {
    return templateId.startsWith(this.PREFIX)
  }
  /**
   * 生成靜態效果實例
   *
   * @param templateId 效果模板 ID (e.g., 'effect_static_attack_power')
   * @param value 詞綴實例的擲骰數值
   * @returns 靜態效果實例
   * @throws InvalidStaticEffectError 當模板格式無效時
   */
  static generate(templateId: string, value: number): IEffect {
    if (!this.isStaticEffect(templateId)) {
      throw new InvalidStaticEffectError(templateId, 'Not a static effect template')
    }
    // 解析屬性類型
    const suffix = templateId.substring(this.PREFIX.length)
    const attributeType = this.ATTRIBUTE_MAP[suffix]
    if (!attributeType) {
      throw new InvalidStaticEffectError(
        templateId,
        `Unknown attribute type '${suffix}'. Supported: ${Object.keys(this.ATTRIBUTE_MAP).join(', ')}`
      )
    }
    // 取得顯示名稱
    const displayName = this.DISPLAY_NAME_MAP[suffix] || suffix
    // 生成效果實例
    return new StaticAttributeEffect(attributeType, value, displayName)
  }
}
