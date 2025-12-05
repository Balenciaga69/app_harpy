import type { ICombatContext } from '@/modules/combat/context'
import type { IResourceRegistry } from '@/modules/combat/infra/resource-registry'
import { CombatError, Failures } from '@/modules/combat/infra/errors'
import type { BaseAttributeValues } from '../attribute/models/base-attribute-values'
import { createDefaultAttributes } from '../attribute/models/base-attribute-values'
import type { IUltimateAbility } from '../ultimate'
import { Character } from './core/Character'
import type { ICharacter } from './models/character'
/**
 * CharacterBuilder
 *
 * Builder pattern for creating Character instances with fluent API.
 * Simplifies complex character configuration with many optional attributes.
 * Supports preset templates for common character archetypes.
 */
export class CharacterBuilder {
  private name: string = 'Unnamed'
  private team: ICharacter['team'] = 'player'
  private registry: IResourceRegistry | null = null
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
  /** Set resource registry (required) */
  withRegistry(registry: IResourceRegistry): this {
    this.registry = registry
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
  /**
   * Build the Character instance
   * @param context Optional combat context for immediate initialization
   * @throws CombatError if registry is not set
   */
  build(context?: ICombatContext): Character {
    if (!this.registry) {
      throw CombatError.fromFailure(Failures.missingRequiredField('registry', 'Use withRegistry() before build()'))
    }
    // Merge template with overrides
    const baseAttributes = this.templateAttributes
      ? { ...this.templateAttributes, ...this.attributeOverrides }
      : createDefaultAttributes(this.attributeOverrides)
    return new Character(
      {
        name: this.name,
        team: this.team,
        registry: this.registry,
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
    this.registry = null
    this.ultimate = undefined
    this.attributeOverrides = {}
    this.templateAttributes = undefined
    return this
  }
}
