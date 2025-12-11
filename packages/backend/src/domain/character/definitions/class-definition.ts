import type { AttributeType } from '@/domain/attribute'
/**
 * IClassDefinition
 *
 * 職業的核心定義介面。
 * 定義職業特性與屬性修正。
 */
export interface IClassDefinition {
  /** 唯一識別碼（如 'warrior', 'mage'） */
  readonly id: string
  /** 職業名稱 */
  readonly name: string
  /** 職業屬性修正（相對於基礎屬性的調整） */
  readonly attributeModifiers: Partial<Record<AttributeType, number>>
  /** 職業專屬裝備池 ID 列表 */
  readonly equipmentPoolIds: readonly string[]
}
