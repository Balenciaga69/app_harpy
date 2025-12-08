import type { AttributeType } from '../../attribute/models/attribute-core.ts'
import type { AttributeModifier } from '../../attribute/models/attribute-modifier.ts'
/** Attribute provider interface */
export interface IAttributeOwner {
  getAttribute(type: AttributeType): number
  getBaseAttribute(type: AttributeType): number
  setBaseAttribute(type: AttributeType, value: number): void
  addAttributeModifier(modifier: AttributeModifier): void
  removeAttributeModifier(modifierId: string): void
  setCurrentHpClamped(value: number): void
}
