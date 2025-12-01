import type { AttributeType, BaseAttributeValues } from './models/attribute.core.model'
import type { AttributeModifier } from './models/attribute.modifier.model'
import { AttributeLimits } from '../../infra/config'
/**
 * AttributeContainer：角色屬性數據的純容器。
 *
 * 設計理念：
 * - 遵循單一職責原則，僅負責數據的儲存與讀取，不涉及計算邏輯。
 * - 作為數據層與計算層的分離點，支援屬性系統的可測試性。
 * - 使用 Map 結構提供高效的屬性查詢與修改操作。
 * - 與 AttributeCalculator 協作，形成關注點分離的屬性管理系統。
 * - 加入屬性驗證機制，確保數值在合理範圍內。
 *
 * 主要職責：
 * - 儲存角色的基礎屬性值（未經修飾符計算的原始數據）。
 * - 管理屬性修飾符的添加、移除與查詢。
 * - 提供屬性修飾符的分類儲存，按屬性類型組織修飾符列表。
 * - 驗證屬性值的合法性，防止超出設計範圍。
 * - 支援屬性數據的序列化與反序列化需求。
 */
export class AttributeContainer {
  private baseValues: Map<AttributeType, number>
  private modifiers: Map<AttributeType, AttributeModifier[]>
  constructor(baseAttributes: BaseAttributeValues) {
    this.baseValues = new Map()
    this.modifiers = new Map()
    // 初始化基礎屬性
    Object.entries(baseAttributes).forEach(([key, value]) => {
      this.baseValues.set(key as AttributeType, value)
    })
  }
  /** 獲取基礎屬性值（不含修飾符） */
  getBase(type: AttributeType): number {
    return this.baseValues.get(type) ?? 0
  }
  /** 設置基礎屬性值（帶驗證） */
  setBase(type: AttributeType, value: number): void {
    const validatedValue = this.validateAttribute(type, value)
    this.baseValues.set(type, validatedValue)
  }
  /** 驗證屬性值是否在合法範圍內 */
  private validateAttribute(type: AttributeType, value: number): number {
    const limit = AttributeLimits[type as keyof typeof AttributeLimits]
    if (!limit) {
      // 如果沒有定義限制，直接返回原值（向後兼容）
      return value
    }
    // 限制在最小值與最大值之間
    const clamped = Math.min(limit.max, Math.max(limit.min, value))
    // 開發模式下警告超出範圍
    if (clamped !== value && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[AttributeContainer] Attribute '${type}' value ${value} clamped to ${clamped} (min: ${limit.min}, max: ${limit.max})`
      )
    }
    return clamped
  }
  /** 添加屬性修飾器 */
  addModifier(modifier: AttributeModifier): void {
    if (!this.modifiers.has(modifier.type)) {
      this.modifiers.set(modifier.type, [])
    }
    this.modifiers.get(modifier.type)!.push(modifier)
  }
  /** 移除屬性修飾器 */
  removeModifier(modifierId: string): void {
    this.modifiers.forEach((list) => {
      const index = list.findIndex((m) => m.id === modifierId)
      if (index !== -1) {
        list.splice(index, 1)
      }
    })
  }
  /** 獲取指定屬性的所有修飾器 */
  getModifiers(type: AttributeType): AttributeModifier[] {
    return this.modifiers.get(type) ?? []
  }
  /** 獲取所有修飾器（用於序列化等） */
  getAllModifiers(): Map<AttributeType, AttributeModifier[]> {
    return new Map(this.modifiers)
  }
}
