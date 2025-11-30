import type { AttributeContainer } from './attribute.container'
import type { IAttributeCalculator } from './interfaces/attribute.calculator.interface'
import type { AttributeType } from './models/attribute.core.model'
import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from './models/attribute.modifier.model'
/**
 * 屬性計算器：
 * 負責計算最終屬性值（基礎值 + 修飾符）。
 */
export class AttributeCalculator implements IAttributeCalculator {
  private container: AttributeContainer
  /** 初始化屬性計算器，注入屬性容器 */
  constructor(container: AttributeContainer) {
    this.container = container
  }
  /** 計算指定屬性類型的最終值（從容器獲取數據） */
  calculateAttribute(type: AttributeType): number {
    const baseValue = this.container.getBase(type)
    const modifiers = this.container.getModifiers(type)
    return this.calculate(baseValue, modifiers)
  }
  /** 計算指定屬性的最終值 */
  calculate(baseValue: number, modifiers: AttributeModifier[]): number {
    const sortedModifiers = this.sortModifiersByPriority(modifiers)
    const additiveModifiers = this.filterModifiersByMode(sortedModifiers, 'add')
    const multiplyModifiers = this.filterModifiersByMode(sortedModifiers, 'multiply')
    const additive = this.calculateAdditiveSum(additiveModifiers)
    const multiplier = this.calculateMultiplierProduct(multiplyModifiers)
    return (baseValue + additive) * multiplier
  }
  /** 按優先級排序修飾器 */
  private sortModifiersByPriority(modifiers: AttributeModifier[]): AttributeModifier[] {
    return [...modifiers].sort((a, b) => {
      const priorityA = (a as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      const priorityB = (b as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      return priorityA - priorityB
    })
  }
  /** 根據模式篩選修飾器 */
  private filterModifiersByMode(modifiers: AttributeModifier[], mode: 'add' | 'multiply'): AttributeModifier[] {
    return modifiers.filter((m) => m.mode === mode)
  }
  /** 計算加法修飾器的總和 */
  private calculateAdditiveSum(modifiers: AttributeModifier[]): number {
    return modifiers.reduce((sum, m) => sum + m.value, 0)
  }
  /** 計算乘法修飾器的總積 */
  private calculateMultiplierProduct(modifiers: AttributeModifier[]): number {
    return modifiers.reduce((product, m) => product * (1 + m.value), 1)
  }
}
