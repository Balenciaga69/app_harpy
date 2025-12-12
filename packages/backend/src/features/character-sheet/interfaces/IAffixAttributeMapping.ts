import { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
import { AttributeType } from '@/features/attribute/interfaces/AttributeType'
import { IAffixDefinition } from '@/features/item/interfaces/affixes/IAffixDefinition'

export interface IAffixAttributeMapping {
  readonly affixId: IAffixDefinition['id']
  /** 影響的屬性類型 */
  readonly attributeType: AttributeType
  /** 修飾器模式（加法或乘法） */
  readonly mode: 'add' | 'multiply'
  /** 數值轉換函數（可選，預設為直接使用 rolledValue） */
  readonly valueTransform?: (rolledValue: number) => number
}

export function createModifierFromAffix(
  affixId: string,
  rolledValue: number,
  mapping: IAffixAttributeMapping
): AttributeModifier {
  const finalValue = mapping.valueTransform ? mapping.valueTransform(rolledValue) : rolledValue
  return {
    id: `affix-${affixId}-${Date.now()}`,
    type: mapping.attributeType,
    mode: mapping.mode,
    value: finalValue,
    source: `Affix:${affixId}`,
  }
}
