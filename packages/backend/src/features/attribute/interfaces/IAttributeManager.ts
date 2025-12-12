import { AttributeType } from './AttributeType'
import type { AttributeModifier as AttributeModifier } from './AttributeModifier'

/**
 * 屬性管理器介面
 *
 * 定義屬性管理器的核心方法。
 */
export interface IAttributeManager {
  /**
   * 取得基礎屬性值（不含修飾器）
   * @param type 屬性類型
   * @returns 基礎值
   */
  getBase(type: AttributeType): number

  /**
   * 設定基礎屬性值（含驗證）
   * @param type 屬性類型
   * @param value 值
   */
  setBase(type: AttributeType, value: number): void

  /**
   * 添加屬性修飾器
   * @param modifier 修飾器
   */
  addModifier(modifier: AttributeModifier): void

  /**
   * 移除屬性修飾器
   * @param modifierId 修飾器ID
   */
  removeModifier(modifierId: string): void

  /**
   * 取得指定屬性的所有修飾器
   * @param type 屬性類型
   * @returns 修飾器列表
   */
  getModifiers(type: AttributeType): AttributeModifier[]

  /**
   * 取得所有修飾器（用於序列化等）
   * @returns 所有修飾器
   */
  getAllModifiers(): Map<AttributeType, AttributeModifier[]>
}
