import type { AttributeContainer } from './attribute.container'
import type { IAttributeCalculator } from './interfaces/attribute.calculator.interface'
import type { AttributeType } from './models/attribute.core.model'
import { type AttributeModifier, type AttributeModifierEx, ModifierPriority } from './models/attribute.modifier.model'
/**
 * AttributeCalculator: Final value calculation engine for attributes.
 *
 * Design concept:
 * - SRP, pure calculation logic tool
 * - Follows single responsibility principle, focuses on attribute calculation logic, without business logic.
 * - Collaborates with AttributeContainer to achieve separation of calculation layer and data layer.
 *
 * Main responsibilities:
 * - Get base values and modifiers from container, calculate final attribute values.
 * - Sort modifiers by priority to ensure calculation order matches game logic.
 * - Separate processing of additive and multiplicative modifiers, apply correct mathematical formulas.
 * - Provide pure calculation methods for external testing and verification.
 */
export class AttributeCalculator implements IAttributeCalculator {
  private container: AttributeContainer
  /** Initialize attribute calculator, inject attribute container */
  constructor(container: AttributeContainer) {
    this.container = container
  }
  /** Calculate final value of specified attribute type (get data from container) */
  calculateAttribute(type: AttributeType): number {
    const baseValue = this.container.getBase(type)
    const modifiers = this.container.getModifiers(type)
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
