import type { ItemRarity } from './IEquipmentDefinition'
import { IItemDefinition } from './IItemDefinition'
/**
 * IRelicDefinition
 *
 * 遺物的核心定義介面，繼承自 IItemDefinition。
 * 遺物可無限堆疊，具有堆疊相關屬性。
 */
export interface IRelicDefinition extends IItemDefinition {
  readonly stackable: boolean
  readonly maxStack: number
  readonly rarity: ItemRarity
  readonly minAffixes: number
  readonly maxAffixes: number
  readonly affixPoolIds: readonly string[]
}
