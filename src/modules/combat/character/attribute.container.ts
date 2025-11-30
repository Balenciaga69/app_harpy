import type { AttributeType, BaseAttributeValues } from './models/attribute.core.model'
import type { AttributeModifier } from './models/attribute.modifier.model'
/**
 * 純數據容器：僅負責儲存與讀取屬性數據
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
  /** 設置基礎屬性值 */
  setBase(type: AttributeType, value: number): void {
    this.baseValues.set(type, value)
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
