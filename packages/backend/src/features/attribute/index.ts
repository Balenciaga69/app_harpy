// domain
export { AttributeDefaults, AttributeLimits, type AttributeLimitKey } from './domain/AttributeConstants'
export { type BaseAttributeValues, createDefaultAttributes } from './domain/AttributeValues'

// interfaces
export {
  type AttributeModifier,
  ModifierPriority,
  type ModifierPriorityType,
  type AttributeModifierEx,
} from './interfaces/AttributeModifier'
export { type AttributeType } from './interfaces/AttributeType'
export { type IAttributeCalculator } from './interfaces/IAttributeCalculator'
export { type IAttributeManager } from './interfaces/IAttributeManager'
