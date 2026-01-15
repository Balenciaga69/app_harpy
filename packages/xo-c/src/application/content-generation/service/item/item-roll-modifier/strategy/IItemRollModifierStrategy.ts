import { ItemRollModifier } from '../../../../../../domain/item/roll/ItemRollModifier'
export interface IItemRollModifierStrategy {
  aggregateModifiers(): ItemRollModifier[]
}
