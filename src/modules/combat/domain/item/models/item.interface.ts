import type { IEffect } from '../../effect/models/effect.model'

/**
 * Item rarity levels
 */
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

/**
 * Item interface - unified abstraction for all equipment and relics
 *
 * Design concept:
 * - All items (weapons, armor, relics) implement this interface
 * - Items can provide multiple effects
 * - Items are effect containers that inject behaviors into characters
 *
 * Usage:
 * - Equipment: unique items, only one can be equipped
 * - Relics: stackable items, can own multiple
 */
export interface IItem {
  /** Unique identifier */
  readonly id: string
  /** Item name */
  readonly name: string
  /** Item description */
  readonly description: string
  /** Item rarity level */
  readonly rarity: ItemRarity
  /** Whether this item can stack (relics can, equipment cannot) */
  readonly stackable: boolean

  /**
   * Get all effects this item provides
   * Effects are applied to character when item is equipped/added
   */
  getEffects(): IEffect[]
}
