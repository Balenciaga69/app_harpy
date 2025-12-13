import { AttributeLimits } from '../domain/AttributeConstants'
import type { AttributeModifier as AttributeModifier } from '../interfaces/AttributeModifier'
import { AttributeType } from '../interfaces/AttributeType'
import type { IAttributeManager } from '../interfaces/IAttributeManager'
import { IBaseAttributeValues } from '../interfaces/IBaseAttributeValues'
/**
 * 屬性管理器
 *
 * 管理角色的基礎屬性值與屬性修飾器。
 * 處理驗證並提供方法來添加、移除和查詢各類型的修飾器。
 *
 * 此類別位於共享層，可被戰鬥內外使用。
 */
export class AttributeManager implements IAttributeManager {
  private baseValues: Map<AttributeType, number>
  private modifiers: Map<AttributeType, AttributeModifier[]>
  constructor(baseAttributes: IBaseAttributeValues) {
    this.baseValues = new Map()
    this.modifiers = new Map()
    // 初始化基礎屬性
    Object.entries(baseAttributes).forEach(([key, value]) => {
      this.baseValues.set(key as AttributeType, value)
    })
  }
  /** 取得基礎屬性值（不含修飾器） */
  getBase(type: AttributeType): number {
    return this.baseValues.get(type) ?? 0
  }
  /** 設定基礎屬性值（含驗證） */
  setBase(type: AttributeType, value: number): void {
    const validatedValue = this.validateAttribute(type, value)
    this.baseValues.set(type, validatedValue)
  }
  /** 驗證屬性值是否在合法範圍內 */
  private validateAttribute(type: AttributeType, value: number): number {
    const limit = AttributeLimits[type]
    if (!limit) return value // 若無限制定義，返回原值（向後兼容）
    return Math.min(limit.max, Math.max(limit.min, value)) // 限制在最小值與最大值之間（靜默操作，限制是預期行為）
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
  /** 取得指定屬性的所有修飾器 */
  getModifiers(type: AttributeType): AttributeModifier[] {
    return this.modifiers.get(type) ?? []
  }
  /** 取得所有修飾器（用於序列化等） */
  getAllModifiers(): Map<AttributeType, AttributeModifier[]> {
    return new Map(this.modifiers)
  }
}
