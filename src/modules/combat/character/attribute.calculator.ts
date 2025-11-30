import type { AttributeContainer } from './attribute.container'
import type { IAttributeCalculator } from './interfaces/attribute.calculator.interface'
import type { AttributeType } from './models/attribute.core.model'
import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from './models/attribute.modifier.model'
/**
 * 屬性計算器：負責計算最終屬性值（基礎值 + 修飾符）
 */
export class AttributeCalculator implements IAttributeCalculator {
  private container: AttributeContainer
  constructor(container: AttributeContainer) {
    this.container = container
  }
  /** 計算指定屬性的最終值 */
  calculate(baseValue: number, modifiers: AttributeModifier[]): number {
    // 按優先級排序修飾器
    const sortedModifiers = [...modifiers].sort((a, b) => {
      const priorityA = (a as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      const priorityB = (b as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      return priorityA - priorityB
    })
    // 分離加法和乘法修飾器
    const additiveModifiers = sortedModifiers.filter((m) => m.mode === 'add')
    const multiplyModifiers = sortedModifiers.filter((m) => m.mode === 'multiply')
    // 計算加法總和
    const additive = additiveModifiers.reduce((sum, m) => sum + m.value, 0)
    // 計算乘法總積
    const multiplier = multiplyModifiers.reduce((product, m) => product * (1 + m.value), 1)
    return (baseValue + additive) * multiplier
  }
  /** 計算指定屬性類型的最終值（從容器獲取數據） */
  calculateAttribute(type: AttributeType): number {
    const baseValue = this.container.getBase(type)
    const modifiers = this.container.getModifiers(type)
    return this.calculate(baseValue, modifiers)
  }
}
