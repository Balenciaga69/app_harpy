// domain
export { AttributeDefaults, AttributeLimits, type AttributeLimitKey } from './domain/AttributeConstants'
export { createDefaultAttributes } from './domain/AttributeValues'
// interfaces
export { type BaseAttributeValues } from './interfaces/BaseAttributeValues'
export {
  type AttributeModifier,
  ModifierPriority,
  type ModifierPriorityType,
  type AttributeModifierEx,
} from './interfaces/AttributeModifier'
export { type AttributeType } from './interfaces/AttributeType'
export { type IAttributeCalculator } from './interfaces/IAttributeCalculator'
export { type IAttributeManager } from './interfaces/IAttributeManager'
