import { BaseAttributeValues, createDefaultAttributes } from '@/features/attribute/domain/AttributeValues'
import type { ICharacter } from '../../interfaces/character/ICharacter'
import type { ICombatContext } from '../../interfaces/context/ICombatContext'
import type { IUltimateAbility } from '../../interfaces/ultimate/IUltimateAbility'
import { Character } from './Character'
export class CharacterBuilder {
  private name: string = 'Unnamed'
  private team: ICharacter['team'] = 'player'
  private ultimate?: IUltimateAbility
  private attributeOverrides: Partial<BaseAttributeValues> = {}
  private templateAttributes?: BaseAttributeValues
  /** Set character name */
  withName(name: string): this {
    this.name = name
    return this
  }
  /** Set character team */
  withTeam(team: ICharacter['team']): this {
    this.team = team
    return this
  }
  /** Set ultimate ability */
  withUltimate(ultimate: IUltimateAbility): this {
    this.ultimate = ultimate
    return this
  }
  /** Use a preset attribute template as base */
  fromTemplate(template: BaseAttributeValues): this {
    this.templateAttributes = template
    return this
  }
  // === Attribute setters ===
  /** Set max HP (also sets current HP to same value) */
  withMaxHp(value: number): this {
    this.attributeOverrides.maxHp = value
    this.attributeOverrides.currentHp = value
    return this
  }
  /** Set current HP independently */
  withCurrentHp(value: number): this {
    this.attributeOverrides.currentHp = value
    return this
  }
  /** Set max energy */
  withMaxEnergy(value: number): this {
    this.attributeOverrides.maxEnergy = value
    return this
  }
  /** Set current energy */
  withCurrentEnergy(value: number): this {
    this.attributeOverrides.currentEnergy = value
    return this
  }
  /** Set energy regen per 100 ticks */
  withEnergyRegen(value: number): this {
    this.attributeOverrides.energyRegen = value
    return this
  }
  /** Set energy gain on attack hit */
  withEnergyGainOnAttack(value: number): this {
    this.attributeOverrides.energyGainOnAttack = value
    return this
  }
  /** Set attack damage */
  withAttackDamage(value: number): this {
    this.attributeOverrides.attackDamage = value
    return this
  }
  /** Set attack cooldown in ticks */
  withAttackCooldown(value: number): this {
    this.attributeOverrides.attackCooldown = value
    return this
  }
  /** Set armor value */
  withArmor(value: number): this {
    this.attributeOverrides.armor = value
    return this
  }
  /** Set evasion value */
  withEvasion(value: number): this {
    this.attributeOverrides.evasion = value
    return this
  }
  /** Set accuracy value */
  withAccuracy(value: number): this {
    this.attributeOverrides.accuracy = value
    return this
  }
  /** Set critical chance (0-1 range) */
  withCriticalChance(value: number): this {
    this.attributeOverrides.criticalChance = value
    return this
  }
  /** Set critical damage multiplier */
  withCriticalMultiplier(value: number): this {
    this.attributeOverrides.criticalMultiplier = value
    return this
  }
  /** Set multiple attributes at once */
  withAttributes(attributes: Partial<BaseAttributeValues>): this {
    this.attributeOverrides = { ...this.attributeOverrides, ...attributes }
    return this
  }
  /** Set resurrection chance (0.03-0.50 range) */
  withResurrectionChance(value: number): this {
    this.attributeOverrides.resurrectionChance = value
    return this
  }
  /** Set resurrection HP percent (0.10-1.00 range) */
  withResurrectionHpPercent(value: number): this {
    this.attributeOverrides.resurrectionHpPercent = value
    return this
  }
  /**
   * Build the Character instance
   * @param context Optional combat context for immediate initialization
   */
  build(context?: ICombatContext): Character {
    // Merge template with overrides
    const baseAttributes = this.templateAttributes
      ? { ...this.templateAttributes, ...this.attributeOverrides }
      : createDefaultAttributes(this.attributeOverrides)
    return new Character(
      {
        name: this.name,
        team: this.team,
        baseAttributes,
        ultimate: this.ultimate,
      },
      context
    )
  }
  /** Reset builder to initial state for reuse */
  reset(): this {
    this.name = 'Unnamed'
    this.team = 'player'
    this.ultimate = undefined
    this.attributeOverrides = {}
    this.templateAttributes = undefined
    return this
  }
}
