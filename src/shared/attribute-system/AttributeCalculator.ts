import type { AttributeManager } from './AttributeManager'
import type { IAttributeCalculator } from './models/attribute-calculator'
import type { AttributeType } from '@/domain/attribute'
import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from './models/attribute-modifier'
/**
 * 屬性計算器
 *
 * 從基礎值和修飾器計算最終屬性值。
 * 依優先級排序修飾器，先套用加法修飾器，再套用乘法修飾器。
 *
 * 計算公式：(基礎值 + Σ加法修飾器) × Π(1 + 乘法修飾器)
 *
 * 此類別位於共享層，可被戰鬥內外使用。
 */
export class AttributeCalculator implements IAttributeCalculator {
  private manager: AttributeManager
  /** 初始化屬性計算器，注入屬性管理器 */
  constructor(manager: AttributeManager) {
    this.manager = manager
  }
  /** 計算指定屬性類型的最終值（從 manager 取得資料） */
  calculateAttribute(type: AttributeType): number {
    const baseValue = this.manager.getBase(type)
    const modifiers = this.manager.getModifiers(type)
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
