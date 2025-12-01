import { nanoid } from 'nanoid'
import type { CharacterSnapshot } from '@/modules/combat/infra/shared'
import type { BaseAttributeValues } from './models/attribute.core.model'
import type { CharacterId } from './interfaces/character.interface'
import type { ICharacter } from './interfaces/character.interface'
import type { CombatContext } from '@/modules/combat/context'
import type { IEffect } from '../effect/models/effect.model'
import type { IItem } from '../item/models/item.interface'
import type { Equipment } from '../item/models/equipment.model'
import type { Relic } from '../item/models/relic.model'
import { EffectManager } from '../effect/effect.manager'
import { AttributeCalculator } from './attribute.calculator'
import { AttributeContainer } from './attribute.container'
import type { AttributeModifier } from './models/attribute.modifier.model'
import type { AttributeType } from './models/attribute.core.model'
import type { IUltimateAbility } from '../../coordination'
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
 * Character
 *
 * Represents an entity in combat. It stores identity, attributes, HP, equipment, relics, and effects.
 * Exposes methods to query/update attributes, manage effects/items, and create snapshots for replay.
 */
export class Character implements ICharacter {
  readonly id: CharacterId
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  /** Character's ultimate (optional) */
  private ultimate?: IUltimateAbility
  /** Equipped items (only one equipment allowed) */
  private equippedItem?: Equipment
  /** Owned relics (stackable) */
  private relics: Relic[] = []
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
  // === Item-related methods ===
  /**
   * Equip an equipment item
   * Only one equipment can be equipped at a time
   * Equipping new equipment will unequip the old one
   */
  equipItem(equipment: Equipment, context: CombatContext): void {
    // Unequip old equipment if exists
    if (this.equippedItem) {
      this.unequipItem(context)
    }
    // Equip new equipment
    this.equippedItem = equipment
    // Apply all effects from this equipment
    equipment.getEffects().forEach((effect) => {
      this.addEffect(effect, context)
    })
  }
  /**
   * Unequip current equipment
   */
  unequipItem(context: CombatContext): void {
    if (!this.equippedItem) return
    // Remove all effects from this equipment
    this.equippedItem.getEffects().forEach((effect) => {
      this.removeEffect(effect.id, context)
    })
    this.equippedItem = undefined
  }
  /**
   * Get currently equipped item
   */
  getEquippedItem(): Equipment | undefined {
    return this.equippedItem
  }
  /**
   * Add a relic
   * If same relic already exists, add stack instead of creating new instance
   */
  addRelic(relic: Relic, context: CombatContext): void {
    // Check if same relic already exists (by name)
    const existingRelic = this.relics.find((r) => r.name === relic.name)
    if (existingRelic) {
      // Add stack to existing relic
      // First remove old effects
      existingRelic.getEffects().forEach((effect) => {
        this.removeEffect(effect.id, context)
      })
      // Add stack
      existingRelic.addStack()
      // Apply new effects
      existingRelic.getEffects().forEach((effect) => {
        this.addEffect(effect, context)
      })
    } else {
      // Add new relic
      this.relics.push(relic)
      relic.getEffects().forEach((effect) => {
        this.addEffect(effect, context)
      })
    }
  }
  /**
   * Remove a relic completely
   */
  removeRelic(relicName: string, context: CombatContext): void {
    const index = this.relics.findIndex((r) => r.name === relicName)
    if (index === -1) return
    const relic = this.relics[index]
    // Remove all effects from this relic
    relic.getEffects().forEach((effect) => {
      this.removeEffect(effect.id, context)
    })
    // Remove relic from list
    this.relics.splice(index, 1)
  }
  /**
   * Get all relics
   */
  getAllRelics(): readonly Relic[] {
    return this.relics
  }
  /**
   * Get all items (equipment + relics)
   */
  getAllItems(): IItem[] {
    const items: IItem[] = []
    if (this.equippedItem) {
      items.push(this.equippedItem)
    }
    items.push(...this.relics)
    return items
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
