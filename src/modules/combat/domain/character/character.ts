import type { CombatContext } from '@/modules/combat/context'
import type { CharacterSnapshot } from '@/modules/combat/infra/shared'
import type { IResourceRegistry } from '@/modules/combat/infra/resource-registry'
import { nanoid } from 'nanoid'
import { EffectManager } from '../effect/effect.manager'
import type { IEffect } from '../effect/models/effect.model'
import type { Equipment } from '../item/models/equipment.model'
import type { IItem } from '../item/models/item.interface'
import type { Relic } from '../item/models/relic.model'
import { AttributeCalculator } from './attribute.calculator'
import { AttributeContainer } from './attribute.container'
import type { CharacterId, ICharacter } from './interfaces/character.interface'
import type { AttributeType, BaseAttributeValues } from './models/attribute.core.model'
import type { AttributeModifier } from './models/attribute.modifier.model'
import type { IUltimateAbility } from '../ultimate'

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
 * Represents an entity in combat. Stores identity, attributes, HP, and resource references.
 * Uses resource registry for global resource lookup while maintaining local ownership of effects.
 */
export class Character implements ICharacter {
  readonly id: CharacterId
  readonly name: string
  readonly team: ICharacter['team']
  isDead: boolean = false

  /** Reference to resource registry (injected dependency) */
  private readonly registry: IResourceRegistry

  /** Character's ultimate ID (optional) */
  private ultimateId: string | null = null

  /** Equipped item ID (only one equipment allowed) */
  private equippedItemId: string | null = null

  /** Owned relic IDs (stackable) */
  private relicIds: string[] = []

  // Privatize internal implementation
  private readonly attributeContainer: AttributeContainer
  private readonly attributeCalculator: AttributeCalculator
  private readonly effectManager: EffectManager

  /** Initialize character, inject registry and set up subsystems */
  constructor(config: CharacterConfig) {
    this.id = nanoid()
    this.team = config.team
    this.name = config.name
    this.registry = config.registry

    // Register ultimate if provided
    if (config.ultimate) {
      this.registry.registerUltimate(config.ultimate)
      this.ultimateId = config.ultimate.id
    }

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
   * Registers equipment to registry and applies its effects
   */
  equipItem(equipment: Equipment, context: CombatContext): void {
    // Unequip old equipment if exists
    if (this.equippedItemId) {
      this.unequipItem(context)
    }

    // Register equipment to registry
    this.registry.registerEquipment(equipment)
    this.equippedItemId = equipment.id

    // Apply all effects from this equipment
    equipment.getEffects().forEach((effect) => {
      this.addEffect(effect, context)
    })
  }

  /**
   * Unequip current equipment
   */
  unequipItem(context: CombatContext): void {
    if (!this.equippedItemId) return

    const equipment = this.registry.getEquipment(this.equippedItemId)
    if (!equipment) return

    // Remove all effects from this equipment
    equipment.getEffects().forEach((effect) => {
      this.removeEffect(effect.id, context)
    })

    this.equippedItemId = null
  }

  /**
   * Get currently equipped item
   */
  getEquippedItem(): Equipment | undefined {
    if (!this.equippedItemId) return undefined
    return this.registry.getEquipment(this.equippedItemId)
  }

  /**
   * Add a relic
   * Registers to registry. If same relic exists, adds stack.
   */
  addRelic(relic: Relic, context: CombatContext): void {
    // Check if same relic already exists (by name)
    const existingRelicId = this.relicIds.find((id) => {
      const r = this.registry.getRelic(id)
      return r?.name === relic.name
    })

    if (existingRelicId) {
      const existingRelic = this.registry.getRelic(existingRelicId)
      if (!existingRelic) return

      // Remove old effects
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
      // Register new relic
      this.registry.registerRelic(relic)
      this.relicIds.push(relic.id)

      // Apply effects
      relic.getEffects().forEach((effect) => {
        this.addEffect(effect, context)
      })
    }
  }

  /**
   * Remove a relic completely
   */
  removeRelic(relicName: string, context: CombatContext): void {
    const relicId = this.relicIds.find((id) => {
      const r = this.registry.getRelic(id)
      return r?.name === relicName
    })

    if (!relicId) return

    const relic = this.registry.getRelic(relicId)
    if (!relic) return

    // Remove all effects from this relic
    relic.getEffects().forEach((effect) => {
      this.removeEffect(effect.id, context)
    })

    // Remove ID from tracking list
    const index = this.relicIds.indexOf(relicId)
    if (index !== -1) {
      this.relicIds.splice(index, 1)
    }
  }

  /**
   * Get all relics
   */
  getAllRelics(): readonly Relic[] {
    return this.relicIds.map((id) => this.registry.getRelic(id)).filter((r): r is Relic => r !== undefined)
  }

  /**
   * Get all items (equipment + relics)
   */
  getAllItems(): IItem[] {
    const items: IItem[] = []
    const equipment = this.getEquippedItem()
    if (equipment) {
      items.push(equipment)
    }
    items.push(...this.getAllRelics())
    return items
  }

  // === Ultimate-related methods ===
  /** Get ultimate (if any) */
  getUltimate(): IUltimateAbility | undefined {
    if (!this.ultimateId) return undefined
    return this.registry.getUltimate(this.ultimateId)
  }

  /** Set ultimate */
  setUltimate(ultimate: IUltimateAbility): void {
    this.registry.registerUltimate(ultimate)
    this.ultimateId = ultimate.id
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
