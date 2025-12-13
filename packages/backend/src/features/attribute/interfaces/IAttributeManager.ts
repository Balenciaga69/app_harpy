import { AttributeType } from './AttributeType'
import type { AttributeModifier as AttributeModifier } from './AttributeModifier'
export interface IAttributeManager {
  getBase(type: AttributeType): number
  setBase(type: AttributeType, value: number): void
  addModifier(modifier: AttributeModifier): void
  removeModifier(modifierId: string): void
  getModifiers(type: AttributeType): AttributeModifier[]
  getAllModifiers(): Map<AttributeType, AttributeModifier[]>
}
