import { AttributeModifier } from './AttributeModifier'
export interface IAttributeCalculator {
  calculate(baseValue: number, modifiers: AttributeModifier[]): number
}
