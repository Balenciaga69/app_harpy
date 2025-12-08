import type { AttributeType } from '@/domain/attribute'

/**
 * 屬性計算器介面
 *
 * 定義屬性計算的核心方法。
 */
export interface IAttributeCalculator {
  /**
   * 計算指定屬性類型的最終值
   * @param type 屬性類型
   * @returns 計算後的最終值
   */
  calculateAttribute(type: AttributeType): number
}
