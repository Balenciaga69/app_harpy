// TODO: 依賴外部模組 @/domain/attribute
import type { AttributeType } from '@/domain/attribute'
// TODO: 依賴外部模組 @/features/attribute-system
import type { AttributeModifier } from '@/features/attribute-system'
/** Attribute provider interface */
export interface IAttributeOwner {
  getAttribute(type: AttributeType): number
  getBaseAttribute(type: AttributeType): number
  setBaseAttribute(type: AttributeType, value: number): void
  addAttributeModifier(modifier: AttributeModifier): void
  removeAttributeModifier(modifierId: string): void
  setCurrentHpClamped(value: number): void
}
