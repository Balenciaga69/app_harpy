// TODO: 依賴外部模組 attribute
import type { AttributeType, AttributeModifier } from '../../../attribute'
/** Attribute provider interface */
export interface IAttributeOwner {
  getAttribute(type: AttributeType): number
  getBaseAttribute(type: AttributeType): number
  setBaseAttribute(type: AttributeType, value: number): void
  addAttributeModifier(modifier: AttributeModifier): void
  removeAttributeModifier(modifierId: string): void
  setCurrentHpClamped(value: number): void
}
