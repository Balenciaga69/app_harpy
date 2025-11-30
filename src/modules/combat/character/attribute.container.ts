import { AttributeCalculatorFactory } from './attribute.calculator'
import type { AttributeType, BaseAttributeValues } from './models/attribute.core.model'
import type { AttributeModifier } from './models/attribute.modifier.model'
/**
 * 存放 base attributes 與 modifiers，並計算各個屬性的最終值
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
  /** 獲取最終計算後的屬性值 */
  get(type: AttributeType): number {
    return this.calculate(type)
  }
  /** 添加屬性修飾器 (由 Effect 調用) */
  addModifier(modifier: AttributeModifier): void {
    if (!this.modifiers.has(modifier.type)) {
      this.modifiers.set(modifier.type, [])
    }
    this.modifiers.get(modifier.type)!.push(modifier)
  }
  /** 移除屬性修飾器 (由 Effect 調用) */
  removeModifier(modifierId: string): void {
    this.modifiers.forEach((list) => {
      const index = list.findIndex((m) => m.id === modifierId)
      if (index !== -1) {
        list.splice(index, 1)
      }
    })
  }
  /** 計算最終屬性值 (基礎值 + 修飾器) */
  private calculate(type: AttributeType): number {
    const base = this.baseValues.get(type) ?? 0
    const mods = this.modifiers.get(type) ?? []
    // 使用計算器工廠獲取對應的計算器
    const calculator = AttributeCalculatorFactory.get(type)
    return calculator.calculate(base, mods)
  }
  /** 直接設置當前 HP (受傷/治療時使用) */
  setCurrentHp(value: number): void {
    const maxHp = this.get('maxHp')
    this.baseValues.set('currentHp', Math.max(0, Math.min(value, maxHp)))
  }
}
