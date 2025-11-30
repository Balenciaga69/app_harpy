import type { IAttributeCalculator } from './interfaces/attribute.calculator.interface'
import type { AttributeType } from './models/attribute.core.model'
import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from './models/attribute.modifier.model'
/**
 * 預設屬性計算器
 * 實作簡單的 (base + additive) * multiplier 邏輯
 */
export class DefaultAttributeCalculator implements IAttributeCalculator {
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
}
/**
 * 屬性計算器工廠
 * 根據屬性類型返回對應的計算器
 */
export class AttributeCalculatorFactory {
  private static calculators = new Map<AttributeType, IAttributeCalculator>()
  // 註冊屬性計算器
  static register(type: AttributeType, calculator: IAttributeCalculator): void {
    this.calculators.set(type, calculator)
  }
  // 獲取屬性計算器 (如果沒有註冊特定計算器，返回預設計算器)
  static get(type: AttributeType): IAttributeCalculator {
    return this.calculators.get(type) ?? new DefaultAttributeCalculator()
  }
  // 初始化預設計算器
  static initializeDefaults(): void {
    // 目前所有屬性都使用預設計算器
    // 將來可以為特定屬性註冊特殊計算器
  }
}
