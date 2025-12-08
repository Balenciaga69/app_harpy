import type { AttributeType } from '@/domain/attribute'
import type { AttributeModifier } from '@/shared/attribute-system'
/** Attribute provider interface */
export interface IAttributeOwner {
  getAttribute(type: AttributeType): number
  getBaseAttribute(type: AttributeType): number
  setBaseAttribute(type: AttributeType, value: number): void
  addAttributeModifier(modifier: AttributeModifier): void
  removeAttributeModifier(modifierId: string): void
  setCurrentHpClamped(value: number): void
}
