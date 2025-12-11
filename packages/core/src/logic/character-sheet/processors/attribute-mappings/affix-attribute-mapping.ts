import type { AttributeType } from '@/domain/attribute'
import type { IAffixDefinition } from '@/domain/item'
import type { AttributeModifier } from '@/logic/attribute-system' /**
 * 詞綴屬性映射配置
 *
 * 定義詞綴如何轉換為屬性修飾器。
 * 用於靜態計算（非戰鬥內動態效果）。
 */
export interface IAffixAttributeMapping {
  readonly affixId: IAffixDefinition['id']
  /** 影響的屬性類型 */
  readonly attributeType: AttributeType
  /** 修飾器模式（加法或乘法） */
  readonly mode: 'add' | 'multiply'
  /** 數值轉換函數（可選，預設為直接使用 rolledValue） */
  readonly valueTransform?: (rolledValue: number) => number
} /**
 * 從詞綴實例創建屬性修飾器
 */
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
