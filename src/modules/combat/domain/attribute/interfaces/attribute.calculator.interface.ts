import type { AttributeModifier } from '../models/attribute.modifier.model'
/** Attribute calculator interface */
export interface IAttributeCalculator {
  calculate(baseValue: number, modifiers: AttributeModifier[]): number
}
