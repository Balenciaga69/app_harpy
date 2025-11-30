import type { AttributeModifier } from '../models/attribute.modifier.model'
/** 屬性計算器介面 */
export interface IAttributeCalculator {
  calculate(baseValue: number, modifiers: AttributeModifier[]): number
}
