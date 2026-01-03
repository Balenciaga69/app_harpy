import { AttributeType } from '@/features/attribute'
export interface ICharacterSheet {
  /** 所有屬性的最終值（基礎值 + 裝備 + 遺物） */
  readonly attributes: Record<AttributeType, number>
  /** 基礎屬性值（不含裝備與遺物） */
  readonly baseAttributes: Record<AttributeType, number>
  /** 裝備提供的屬性修飾器數量 */
  readonly equipmentModifierCount: number
  /** 遺物提供的屬性修飾器數量 */
  readonly relicModifierCount: number
}
