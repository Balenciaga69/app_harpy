import type { AttributeType } from '@/domain/attribute'
import type { IEffect } from '../models/effect'
import type { IEffectServices } from '../models/effect-services'
import type { AttributeModifier } from '@/logic/attribute-system'
import { InvalidStaticEffectError } from '../errors'
import { nanoid } from 'nanoid'
/**
 * 靜態屬性效果
 *
 * 輕量級效果實作，僅提供屬性加成，不註冊任何鉤子。
 * 用於 effect_static_* 類型的效果模板。
 */
class StaticAttributeEffect implements IEffect {
  readonly id: string
  readonly name: string
  readonly cleanseOnRevive: boolean = false
  private attributeType: AttributeType
  private value: number
  private modifierId: string
  constructor(attributeType: AttributeType, value: number, displayName: string) {
    this.id = `static-${attributeType}-${nanoid(6)}`
    this.modifierId = `modifier-${this.id}`
    this.name = displayName
    this.attributeType = attributeType
    this.value = value
  }
  onApply(characterId: string, services: IEffectServices): void {
    const character = services.getCharacter(characterId)
    const modifier: AttributeModifier = {
      id: this.modifierId,
      type: this.attributeType,
      value: this.value,
      mode: 'add',
      source: this.name,
    }
    character.addAttributeModifier(modifier)
  }
  onRemove(characterId: string, services: IEffectServices): void {
    const character = services.getCharacter(characterId)
    character.removeAttributeModifier(this.modifierId)
  }
  /** 取得屬性類型 */
  getAttributeType(): AttributeType {
    return this.attributeType
  }
  /** 取得數值 */
  getValue(): number {
    return this.value
  }
}
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
