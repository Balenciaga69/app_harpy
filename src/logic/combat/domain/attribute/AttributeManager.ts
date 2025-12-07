import type { AttributeType, BaseAttributeValues } from './models/attribute-core.ts'
import type { AttributeModifier } from './models/attribute-modifier.ts'
import { AttributeLimits } from '@/domain/attribute'
/**
 * AttributeManager
 *
 * Manages base attribute values and attribute modifiers for a character.
 * Handles validation and provides methods to add, remove, and query modifiers by type.
 */
export class AttributeManager {
  private baseValues: Map<AttributeType, number>
  private modifiers: Map<AttributeType, AttributeModifier[]>
  constructor(baseAttributes: BaseAttributeValues) {
    this.baseValues = new Map()
    this.modifiers = new Map()
    // Initialize base attributes
    Object.entries(baseAttributes).forEach(([key, value]) => {
      this.baseValues.set(key as AttributeType, value)
    })
  }
  /** Get base attribute value (without modifiers) */
  getBase(type: AttributeType): number {
    return this.baseValues.get(type) ?? 0
  }
  /** Set base attribute value (with validation) */
  setBase(type: AttributeType, value: number): void {
    const validatedValue = this.validateAttribute(type, value)
    this.baseValues.set(type, validatedValue)
  }
  /** Validate if attribute value is within legal range */
  private validateAttribute(type: AttributeType, value: number): number {
    const limit = AttributeLimits[type as keyof typeof AttributeLimits]
    if (!limit) {
      // If no limit defined, return original value (backward compatibility)
      return value
    }
    // Clamp between min and max values (silent operation, clamping is expected behavior)
    return Math.min(limit.max, Math.max(limit.min, value))
  }
  /** Add attribute modifier */
  addModifier(modifier: AttributeModifier): void {
    if (!this.modifiers.has(modifier.type)) {
      this.modifiers.set(modifier.type, [])
    }
    this.modifiers.get(modifier.type)!.push(modifier)
  }
  /** Remove attribute modifier */
  removeModifier(modifierId: string): void {
    this.modifiers.forEach((list) => {
      const index = list.findIndex((m) => m.id === modifierId)
      if (index !== -1) {
        list.splice(index, 1)
      }
    })
  }
  /** Get all modifiers for specified attribute */
  getModifiers(type: AttributeType): AttributeModifier[] {
    return this.modifiers.get(type) ?? []
  }
  /** Get all modifiers (for serialization etc.) */
  getAllModifiers(): Map<AttributeType, AttributeModifier[]> {
    return new Map(this.modifiers)
  }
}
