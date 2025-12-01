import { nanoid } from 'nanoid'
import type { IEffect } from '../../effect/models/effect.model'
import type { IItem, ItemRarity } from './item.interface'
/**
 * Equipment configuration
 */
export interface EquipmentConfig {
  id?: string
  name: string
  description: string
  rarity: ItemRarity
}
/**
 * Equipment base class
 *
 * Represents unique items that can only be equipped once
 * Examples: weapons, armor, helmets, necklaces
 *
 * Design pattern:
 * - Template Method: subclasses override initializeEffects()
 * - Each equipment defines its own effect composition
 */
export abstract class Equipment implements IItem {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly rarity: ItemRarity
  readonly stackable = false
  protected effects: IEffect[] = []
  constructor(config: EquipmentConfig) {
    this.id = config.id ?? `equipment-${nanoid(6)}`
    this.name = config.name
    this.description = config.description
    this.rarity = config.rarity
    this.initializeEffects()
  }
  /**
   * Initialize effects provided by this equipment
   * Subclasses must implement this to define their effect composition
   */
  protected abstract initializeEffects(): void
  getEffects(): IEffect[] {
    return this.effects
  }
}
