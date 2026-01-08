import { ItemRarity } from '../../../../../../domain/item/Item'
import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
/**
 * 獎勵修飾符策略：稀有度偏好策略
 * 業務規則：調整不同稀有度的生成權重
 * 適用獎勵類型：HIGH_RARITY_RELIC
 */
export class RarityRewardModifierStrategy implements IItemRollModifierStrategy {
  private readonly rarityMultipliers: Map<ItemRarity, number>
  constructor(rarityMultipliers: Partial<Record<ItemRarity, number>>) {
    this.rarityMultipliers = new Map(Object.entries(rarityMultipliers) as [ItemRarity, number][])
  }
  aggregateModifiers(): ItemRollModifier[] {
    return Array.from(this.rarityMultipliers.entries()).map(([rarity, multiplier]) => ({
      type: 'RARITY' as const,
      rarity,
      multiplier,
      durationStages: 0,
    }))
  }
}
