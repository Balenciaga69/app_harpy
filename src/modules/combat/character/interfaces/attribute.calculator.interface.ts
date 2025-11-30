import type { AttributeModifier } from '../models/attribute.modifier.model'
export interface IAttributeCalculator {
  calculate(baseValue: number, modifiers: AttributeModifier[]): number
}
