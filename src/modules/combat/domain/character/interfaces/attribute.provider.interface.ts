import type { AttributeType } from '../models/attribute.core.model'
import type { AttributeModifier } from '../models/attribute.modifier.model'
/** Attribute provider interface */
export interface IAttributeProvider {
  getAttribute(type: AttributeType): number
  getBaseAttribute(type: AttributeType): number
  setBaseAttribute(type: AttributeType, value: number): void
  addAttributeModifier(modifier: AttributeModifier): void
  removeAttributeModifier(modifierId: string): void
  setCurrentHpClamped(value: number): void
}
