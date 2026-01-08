import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'

export interface IItemRollModifierStrategy {
  /** 聚合並返回修飾符清單 */
  aggregateModifiers(): ItemRollModifier[]
}
