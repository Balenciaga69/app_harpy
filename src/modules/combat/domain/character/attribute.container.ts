import type { AttributeType, BaseAttributeValues } from './models/attribute.core.model'
import type { AttributeModifier } from './models/attribute.modifier.model'
import { AttributeLimits } from '../../infra/config'
/**
 * AttributeContainer: Pure container for character attribute data.
 *
 * Design philosophy:
 * - Follows single responsibility principle, only handles data storage and retrieval, no calculation logic.
 * - Serves as separation point between data layer and calculation layer, supports testability of attribute system.
 * - Uses Map structure for efficient attribute query and modification operations.
 * - Collaborates with AttributeCalculator to form a separation of concerns attribute management system.
 * - Includes attribute validation mechanism to ensure values are within reasonable ranges.
 *
 * Main responsibilities:
 * - Store character's base attribute values (raw data without modifier calculations).
 * - Manage addition, removal, and querying of attribute modifiers.
 * - Provide categorized storage of attribute modifiers, organized by attribute type.
 * - Validate legality of attribute values, prevent exceeding design ranges.
 * - Support serialization and deserialization needs of attribute data.
 */
export class AttributeContainer {
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
    // Clamp between min and max values
    const clamped = Math.min(limit.max, Math.max(limit.min, value))
    // Warn about out-of-range values in development mode
    if (clamped !== value && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[AttributeContainer] Attribute '${type}' value ${value} clamped to ${clamped} (min: ${limit.min}, max: ${limit.max})`
      )
    }
    return clamped
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
