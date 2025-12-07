import type { AttributeModifier } from './attribute-modifier.ts'
/** Attribute calculator interface */
export interface IAttributeCalculator {
  calculate(baseValue: number, modifiers: AttributeModifier[]): number
}
