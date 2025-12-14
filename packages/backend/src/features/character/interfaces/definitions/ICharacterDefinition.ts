import type { BaseAttributeValues } from '@/features/attribute/interfaces/BaseAttributeValues'
/**
 * ICharacterDefinition
 *
 * 角色的核心定義介面。
 * 描述「什麼是這個角色」，純資料結構，可序列化為 JSON。
 */
export interface ICharacterDefinition {
  /** 唯一識別碼 */
  readonly id: string
  /** 角色名稱 */
  readonly name: string
  /** 對應職業 ID */
  readonly classId: string
  /** 基礎屬性配置 */
  readonly baseAttributes: BaseAttributeValues
}
