import { ItemRollModifier } from '../../../../../domain/item/roll/ItemRollModifier'
/**
 * 物品骰選修飾符策略介面
 * 責任：根據不同來源（商店/獎勵）或獎勵類型，聚合相應的修飾符
 */
export interface IItemRollModifierStrategy {
  /**
   * 聚合該策略適用的所有修飾符
   * 多個策略的修飾符最終會被合併，權重採用相乘邏輯
   */
  aggregateModifiers(): ItemRollModifier[]
}
