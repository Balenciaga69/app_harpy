import { nanoid } from 'nanoid'
import type { CharacterSnapshot } from '@/modules/combat/infra/shared'
import type { IUltimateAbility } from '../../coordination/models/ultimate.ability.interface'
import type { BaseAttributeValues } from './models/attribute.core.model'
import type { CharacterId } from './interfaces/character.interface'
import type { ICharacter } from './interfaces/character.interface'
import type { CombatContext } from '@/modules/combat/context'
import type { IEffect } from '../effect/models/effect.model'
import { EffectManager } from '../effect/effect.manager'
import { AttributeCalculator } from './attribute.calculator'
import { AttributeContainer } from './attribute.container'
import type { AttributeModifier } from './models/attribute.modifier.model'
import type { AttributeType } from './models/attribute.core.model'
/**
 * Configuration parameters required for character initialization
 */
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: ICharacter['team']
  ultimate?: IUltimateAbility
}
/**
 * Character: Core entity in combat system, representing characters participating in combat.
 *
 * Design concept:
 * - Implementation of Facade pattern, simplifies interfaces for character-related operations.
 * - Follows composition over inheritance principle, implements complex functions through combination of specialized components.
 * - Encapsulates internal implementation details, exposes only necessary public interfaces, reduces external coupling.
 * - Implements ICharacter interface, ensures consistency and replaceability of character behavior.
 * - Supports dynamic attribute modification and dynamic effect management, adapts to various changes in combat.
 *
 * Main responsibilities:
 * - Manage character's basic information.
 * - Provide attribute-related operation interfaces, delegate to internal containers and calculators for processing.
 * - Provide effect-related operation interfaces, delegate to EffectManager for processing.
 * - Ensure HP change value legality (limit between 0 and maximum when taking damage/healing).
 */
export class Character implements ICharacter {
  readonly id: CharacterId
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  /** Character's ultimate (optional) */
  private ultimate?: IUltimateAbility
  // Privatize internal implementation
  private readonly attributeContainer: AttributeContainer
  private readonly attributeCalculator: AttributeCalculator
  private readonly effectManager: EffectManager
  /** Initialize character, inject attribute container and effect manager */
  constructor(config: CharacterConfig) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    this.ultimate = config.ultimate
    this.attributeContainer = new AttributeContainer(config.baseAttributes)
    this.attributeCalculator = new AttributeCalculator(this.attributeContainer)
    this.effectManager = new EffectManager(this)
  }
  // === Attribute-related methods ===
  /** Get final attribute value (including modifier calculation) */
  getAttribute(type: AttributeType): number {
    return this.attributeCalculator.calculateAttribute(type)
  }
  /** Get base attribute value (without modifiers) */
  getBaseAttribute(type: AttributeType): number {
    return this.attributeContainer.getBase(type)
  }
  /** Set base attribute value */
  setBaseAttribute(type: AttributeType, value: number): void {
    this.attributeContainer.setBase(type, value)
  }
  /** Add attribute modifier */
  addAttributeModifier(modifier: AttributeModifier): void {
    this.attributeContainer.addModifier(modifier)
  }
  /** Remove attribute modifier */
  removeAttributeModifier(modifierId: string): void {
    this.attributeContainer.removeModifier(modifierId)
  }
  /** Set current HP and limit within legal range (used when taking damage/healing) */
  setCurrentHpClamped(value: number): void {
    const MIN_HP = 0 as const
    const maxHp = this.getAttribute('maxHp')
    const clampedValue = Math.max(MIN_HP, Math.min(value, maxHp))
    this.setBaseAttribute('currentHp', clampedValue)
  }
  // === Effect-related methods ===
  /** Add effect */
  addEffect(effect: IEffect, context: CombatContext): void {
    this.effectManager.addEffect(effect, context)
  }
  /** Remove effect */
  removeEffect(effectId: string, context: CombatContext): void {
    this.effectManager.removeEffect(effectId, context)
  }
  /** Check if has specified effect */
  hasEffect(effectId: string): boolean {
    return this.effectManager.hasEffect(effectId)
  }
  /** Get specified effect */
  getEffect(effectId: string): IEffect | undefined {
    return this.effectManager.getEffect(effectId)
  }
  /** Get all effects */
  getAllEffects(): readonly IEffect[] {
    return this.effectManager.getAllEffects()
  }
  // === Ultimate-related methods ===
  /** Get ultimate (if any) */
  getUltimate(): IUltimateAbility | undefined {
    return this.ultimate
  }
  /** Set ultimate */
  setUltimate(ultimate: IUltimateAbility): void {
    this.ultimate = ultimate
  }
  // === Snapshot-related methods ===
  /** Create character snapshot (for replay, log recording) */
  createSnapshot(): CharacterSnapshot {
    return {
      id: this.id,
      name: this.name,
      currentHp: this.getAttribute('currentHp'),
      maxHp: this.getAttribute('maxHp'),
      isDead: this.isDead,
      effects: this.getAllEffects().map((e) => e.name),
    }
  }
}
