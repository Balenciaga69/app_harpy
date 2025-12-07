import type { ICombatContext } from '@/logic/combat/context/index.ts'
import type { CharacterSnapshot } from '@/logic/combat/infra/shared/index.ts'
import { nanoid } from 'nanoid'
import { AttributeCalculator, AttributeManager } from '../../attribute/index.ts'
import type { AttributeType, BaseAttributeValues } from '../../attribute/models/attribute-core.ts'
import type { AttributeModifier } from '../../attribute/models/attribute-modifier.ts'
import { EffectManager } from '../../effect/EffectManager.ts'
import type { IEffect } from '../../effect/models/effect.ts'
import { EquipmentManager, RelicManager } from '../../item/index.ts'
import type { ICombatEquipment, ICombatRelic } from '../../item/models/combat-item.ts'
import type { EquipmentSlot } from '@/domain/item'
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
 */
export class Character implements ICharacter {
  readonly id: string
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false
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
    // Initialize attribute system
    this.attributeManager = new AttributeManager(config.baseAttributes)
    this.attributeCalculator = new AttributeCalculator(this.attributeManager)
    // Initialize managers
    this.effectManager = new EffectManager(this)
    this.equipmentManager = new EquipmentManager(this)
    this.relicManager = new RelicManager(this)
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
  /** 裝備物品到指定槽位 */
  equipItem(equipment: ICombatEquipment, context: ICombatContext): void {
    this.equipmentManager.equip(equipment, context)
  }
  /** 從指定槽位卸下裝備 */
  unequipItem(slot: EquipmentSlot, context: ICombatContext): void {
    this.equipmentManager.unequip(slot, context)
  }
  /** 取得指定槽位的裝備 */
  getEquipment(slot: EquipmentSlot): ICombatEquipment | undefined {
    return this.equipmentManager.getEquipment(slot)
  }
  /** 取得所有已裝備的物品 */
  getAllEquipment(): ICombatEquipment[] {
    return this.equipmentManager.getAllEquipment()
  }
  // === Relic-related methods (delegated to RelicManager) ===
  /** 添加遺物（同名遺物會堆疊） */
  addRelic(relic: ICombatRelic, context: ICombatContext): void {
    this.relicManager.add(relic, context)
  }
  /** 移除遺物 */
  removeRelic(relicName: string, context: ICombatContext): void {
    this.relicManager.remove(relicName, context)
  }
  /** 根據名稱取得遺物 */
  getRelic(relicName: string): ICombatRelic | undefined {
    return this.relicManager.getRelic(relicName)
  }
  /** 取得所有遺物 */
  getAllRelics(): ICombatRelic[] {
    return this.relicManager.getAllRelics()
  }
  /** 取得遺物的堆疊數 */
  getRelicStackCount(relicName: string): number {
    return this.relicManager.getStackCount(relicName)
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
