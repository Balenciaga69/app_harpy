import type { BaseAttributeValues } from '@/features/attribute/interfaces/BaseAttributeValues'
import type { AttributeModifier } from '@/features/attribute/interfaces/AttributeModifier'
export type RelicAttributeCalculator = (baseAttributes: BaseAttributeValues, stackCount: number) => AttributeModifier[]
/**
 * 遺物屬性映射配置
 *
 * 定義遺物如何轉換為屬性修飾器。
 * 支援複雜的計算邏輯（如基於其他屬性的轉換）。
 */
export interface IRelicAttributeMapping {
  /** 遺物定義 ID（來自 IRelicDefinition.id） */
  readonly relicId: string
  /** 屬性計算函數 */
  readonly calculator: RelicAttributeCalculator
}
