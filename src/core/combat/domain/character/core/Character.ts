import type { ICombatContext } from '@/core/combat/context/index.ts'
import type { IResourceRegistry } from '@/core/combat/infra/resource-registry/index.ts'
import type { CharacterSnapshot } from '@/core/combat/infra/shared/index.ts'
import { nanoid } from 'nanoid'
import { AttributeCalculator, AttributeManager } from '../../attribute/index.ts'
import type { AttributeType, BaseAttributeValues } from '../../attribute/models/attribute-core.ts'
import type { AttributeModifier } from '../../attribute/models/attribute-modifier.ts'
import { EffectManager } from '../../effect/EffectManager.ts'
import type { IEffect } from '../../effect/models/effect.ts'
import { EquipmentManager, type EquipmentSlot } from '../../item/index.ts'
import type { Equipment } from '../../item/models/equipment.ts'
import type { IItem } from '../../item/models/item.ts'
import type { Relic } from '../../item/models/relic.ts'
import { RelicManager } from '../../item/RelicManager.ts'
import type { IUltimateAbility } from '../../ultimate/index.ts'
import { UltimateManager } from '../../ultimate/UltimateManager.ts'
import type { ICharacter } from '../models/character.ts'
/**
 * Configuration parameters required for character initialization
 */
interface CharacterConfig {
  name: string
  baseAttributes: BaseAttributeValues
  team: ICharacter['team']
  ultimate?: IUltimateAbility
  registry: IResourceRegistry
}
/**
 * Character
 *
 * Represents an entity in combat. Uses managers to organize responsibilities:
 * - EffectManager: manages effects
 * - EquipmentManager: manages equipment slots
 * - RelicManager: manages stackable relics
 * - UltimateManager: manages ultimate ability
 *
 * Uses string ID instead of branded types for simplicity.
 * All resources are looked up via registry, not stored directly.
 */
export class Character implements ICharacter {
  readonly id: string
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
  private readonly registry: IResourceRegistry
  private readonly attributeManager: AttributeManager
  private readonly attributeCalculator: AttributeCalculator
  private readonly effectManager: EffectManager
  private readonly equipmentManager: EquipmentManager
  private readonly relicManager: RelicManager
  private readonly ultimateManager: UltimateManager
  private _pendingUltimate?: IUltimateAbility
  constructor(config: CharacterConfig, context?: ICombatContext) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    this.registry = config.registry
    // Initialize attribute system
    this.attributeManager = new AttributeManager(config.baseAttributes)
    this.attributeCalculator = new AttributeCalculator(this.attributeManager)
    // Initialize managers with registry
    this.effectManager = new EffectManager(this)
    this.equipmentManager = new EquipmentManager(this, this.registry)
    this.relicManager = new RelicManager(this, this.registry)
    this.ultimateManager = new UltimateManager()
    // Register ultimate if provided (only if context is available)
    if (config.ultimate && context) {
      this.ultimateManager.set(config.ultimate, context)
    } else if (config.ultimate) {
      // Store for later initialization if context not available
      this._pendingUltimate = config.ultimate
    }
  }
  // === Attribute-related methods ===
  /** Get final attribute value (including modifier calculation) */
  getAttribute(type: AttributeType): number {
    return this.attributeCalculator.calculateAttribute(type)
  }
  /** Get base attribute value (without modifiers) */
  getBaseAttribute(type: AttributeType): number {
    return this.attributeManager.getBase(type)
  }
  /** Set base attribute value */
  setBaseAttribute(type: AttributeType, value: number): void {
    this.attributeManager.setBase(type, value)
  }
  /** Add attribute modifier */
  addAttributeModifier(modifier: AttributeModifier): void {
    this.attributeManager.addModifier(modifier)
  }
  /** Remove attribute modifier */
  removeAttributeModifier(modifierId: string): void {
    this.attributeManager.removeModifier(modifierId)
  }
  /** Set current HP and limit within legal range (used when taking damage/healing) */
  setCurrentHpClamped(value: number): void {
    const MIN_HP = 0 as const
    const maxHp = this.getAttribute('maxHp')
    const clampedValue = Math.max(MIN_HP, Math.min(value, maxHp))
    this.setBaseAttribute('currentHp', clampedValue)
  }
  // === Effect-related methods (delegated to EffectManager) ===
  /** Add effect */
  addEffect(effect: IEffect, context: ICombatContext): void {
    this.effectManager.addEffect(effect, context)
  }
  /** Remove effect */
  removeEffect(effectId: string, context: ICombatContext): void {
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
  /** Cleanse effects with cleanseOnRevive: true (used for resurrection) */
  cleanseCanCleanseEffects(context: ICombatContext): void {
    this.effectManager.cleanseCanCleanseEffects(context)
  }
  /** Trigger onHpZero hook for all effects */
  triggerHpZero(context: ICombatContext): void {
    this.effectManager.triggerHpZero(context)
  }
  /** Trigger onRevive hook for all effects */
  triggerRevive(context: ICombatContext): void {
    this.effectManager.triggerRevive(context)
  }
  // === Equipment-related methods (delegated to EquipmentManager) ===
  /**
   * Equip an equipment to specified slot
   */
  equipItem(equipment: Equipment, slot: EquipmentSlot, context: ICombatContext): void {
    this.equipmentManager.equip(equipment, slot, context)
  }
  /**
   * Unequip equipment from specified slot
   */
  unequipItem(slot: EquipmentSlot, context: ICombatContext): void {
    this.equipmentManager.unequip(slot, context)
  }
  /**
   * Get equipment in specified slot
   */
  getEquipment(slot: EquipmentSlot): Equipment | undefined {
    return this.equipmentManager.getEquipment(slot)
  }
  /**
   * Get all equipped items
   */
  getAllEquipment(): Equipment[] {
    return this.equipmentManager.getAllEquipment()
  }
  // === Relic-related methods (delegated to RelicManager) ===
  /**
   * Add a relic (stacks if same name exists)
   */
  addRelic(relic: Relic, context: ICombatContext): void {
    this.relicManager.add(relic, context)
  }
  /**
   * Remove a relic completely
   */
  removeRelic(relicName: string, context: ICombatContext): void {
    this.relicManager.remove(relicName, context)
  }
  /**
   * Get relic by name
   */
  getRelic(relicName: string): Relic | undefined {
    return this.relicManager.getRelic(relicName)
  }
  /**
   * Get all relics
   */
  getAllRelics(): Relic[] {
    return this.relicManager.getAllRelics()
  }
  /**
   * Get stack count of a relic
   */
  getRelicStackCount(relicName: string): number {
    return this.relicManager.getStackCount(relicName)
  }
  /**
   * Get all items (equipment + relics)
   */
  getAllItems(): IItem[] {
    const items: IItem[] = []
    items.push(...this.getAllEquipment())
    items.push(...this.getAllRelics())
    return items
  }
  // === Ultimate-related methods (delegated to UltimateManager) ===
  /** Get ultimate (if any) */
  getUltimate(context: ICombatContext): IUltimateAbility | undefined {
    // Initialize pending ultimate if exists
    if (this._pendingUltimate) {
      this.ultimateManager.set(this._pendingUltimate, context)
      this._pendingUltimate = undefined
    }
    return this.ultimateManager.get(context)
  }
  /** Set ultimate */
  setUltimate(ultimate: IUltimateAbility, context: ICombatContext): void {
    this.ultimateManager.set(ultimate, context)
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
