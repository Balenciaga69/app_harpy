import { nanoid } from 'nanoid'
import type { IEffect } from '../../effect/models/effect'
import type { IItem, ItemRarity } from './item'
/**
 * Relic configuration
 */
export interface RelicConfig {
  id?: string
  name: string
  rarity: ItemRarity
}
/**
 * Relic base class
 *
 * Represents stackable items that can be owned multiple times
 * Each stack may enhance the effect or provide independent instances
 *
 * Design pattern:
 * - Template Method: subclasses override initializeEffects() and onStackChanged()
 * - Observer: notifies when stack count changes
 */
export abstract class Relic implements IItem {
  readonly id: string
  readonly name: string
  readonly rarity: ItemRarity
  readonly stackable = true
  protected effects: IEffect[] = []
  private stackCount: number = 1
  constructor(config: RelicConfig) {
    this.id = config.id ?? `relic-${nanoid(6)}`
    this.name = config.name
    this.rarity = config.rarity
    this.initializeEffects()
  }
  /**
   * Initialize effects provided by this relic
   * Subclasses must implement this to define their effect composition
   */
  protected abstract initializeEffects(): void
  getEffects(): IEffect[] {
    return this.effects
  }
  /** Get current stack count */
  getStackCount(): number {
    return this.stackCount
  }
  /**
   * Add one stack to this relic
   * Triggers onStackChanged() for subclasses to handle
   */
  addStack(): void {
    this.stackCount++
    this.onStackChanged()
  }
  /**
   * Handle stack count changes
   * Subclasses can override this to refresh effects based on new stack count
   */
  protected abstract onStackChanged(): void
}
