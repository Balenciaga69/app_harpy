import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from '../interfaces/AttributeModifier'
import type { IAttributeCalculator } from '../interfaces/IAttributeCalculator'

export class AttributeCalculator implements IAttributeCalculator {
  constructor() {}

  /** 計算指定屬性的最終值 */
  calculate(baseValue: number, modifiers: AttributeModifier[]): number {
    // 先排序再加法後乘法
    const sortedModifiers = this.sortModifiersByPriority(modifiers)
    const additiveModifiers = this.filterModifiersByMode(sortedModifiers, 'add')
    const multiplyModifiers = this.filterModifiersByMode(sortedModifiers, 'multiply')
    const additive = this.calculateAdditiveSum(additiveModifiers)
    const multiplier = this.calculateMultiplierProduct(multiplyModifiers)
    return (baseValue + additive) * multiplier
  }
  // === 輔助方法 ===
  /** 依優先級排序修飾器 */
  private sortModifiersByPriority(modifiers: AttributeModifier[]): AttributeModifier[] {
    return [...modifiers].sort((a, b) => {
      const priorityA = (a as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      const priorityB = (b as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      return priorityA - priorityB
    })
  }
  /** 依模式過濾修飾器 */
  private filterModifiersByMode(modifiers: AttributeModifier[], mode: 'add' | 'multiply'): AttributeModifier[] {
    return modifiers.filter((m) => m.mode === mode)
  }
  /** 計算加法修飾器總和 */
  private calculateAdditiveSum(modifiers: AttributeModifier[]): number {
    return modifiers.reduce((sum, m) => sum + m.value, 0)
  }
  /** 計算乘法修飾器乘積 */
  private calculateMultiplierProduct(modifiers: AttributeModifier[]): number {
    return modifiers.reduce((product, m) => product * (1 + m.value), 1)
  }
}
