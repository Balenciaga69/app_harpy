import { ItemRarity } from '../../../../../../domain/item/Item'
import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
export class RarityRewardModifierStrategy implements IItemRollModifierStrategy {
  private readonly rarityMultipliers: Map<ItemRarity, number>
  constructor(rarityMultipliers: Partial<Record<ItemRarity, number>>) {
    this.rarityMultipliers = new Map(Object.entries(rarityMultipliers) as [ItemRarity, number][])
  }
  aggregateModifiers(): ItemRollModifier[] {
    return [...this.rarityMultipliers.entries()].map(([rarity, multiplier]) => ({
      type: 'RARITY' as const,
      rarity,
      multiplier,
      durationStages: 0,
    }))
  }
}
