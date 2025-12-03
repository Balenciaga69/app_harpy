import type { AttributeManager } from './AttributeManager.ts'
import type { IAttributeCalculator } from './models/attribute-calculator.ts'
import type { AttributeType } from './models/attribute-core.ts'
import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from './models/attribute-modifier.ts'
/**
 * AttributeCalculator
 *
 * Computes a final attribute value from base values and modifiers. Sorts modifiers by priority
 * and applies additive modifiers first, then multiplicative modifiers.
 */
export class AttributeCalculator implements IAttributeCalculator {
  private manager: AttributeManager
  /** Initialize attribute calculator, inject attribute manager */
  constructor(manager: AttributeManager) {
    this.manager = manager
  }
  /** Calculate final value of specified attribute type (get data from manager) */
  calculateAttribute(type: AttributeType): number {
    const baseValue = this.manager.getBase(type)
    const modifiers = this.manager.getModifiers(type)
    return this.calculate(baseValue, modifiers)
  }
  /** Calculate final value of specified attribute */
  calculate(baseValue: number, modifiers: AttributeModifier[]): number {
    const sortedModifiers = this.sortModifiersByPriority(modifiers)
    const additiveModifiers = this.filterModifiersByMode(sortedModifiers, 'add')
    const multiplyModifiers = this.filterModifiersByMode(sortedModifiers, 'multiply')
    const additive = this.calculateAdditiveSum(additiveModifiers)
    const multiplier = this.calculateMultiplierProduct(multiplyModifiers)
    return (baseValue + additive) * multiplier
  }
  // === Helper methods ===
  /** Sort modifiers by priority */
  private sortModifiersByPriority(modifiers: AttributeModifier[]): AttributeModifier[] {
    return [...modifiers].sort((a, b) => {
      const priorityA = (a as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      const priorityB = (b as AttributeModifierEx).priority ?? ModifierPriority.NORMAL
      return priorityA - priorityB
    })
  }
  /** Filter modifiers by mode */
  private filterModifiersByMode(modifiers: AttributeModifier[], mode: 'add' | 'multiply'): AttributeModifier[] {
    return modifiers.filter((m) => m.mode === mode)
  }
  /** Calculate sum of additive modifiers */
  private calculateAdditiveSum(modifiers: AttributeModifier[]): number {
    return modifiers.reduce((sum, m) => sum + m.value, 0)
  }
  /** Calculate product of multiplicative modifiers */
  private calculateMultiplierProduct(modifiers: AttributeModifier[]): number {
    return modifiers.reduce((product, m) => product * (1 + m.value), 1)
  }
}
