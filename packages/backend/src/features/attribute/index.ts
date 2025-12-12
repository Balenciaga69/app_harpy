// app
export { AttributeCalculator } from './app/AttributeCalculator'
export { AttributeManager } from './app/AttributeManager'

// domain
export { AttributeDefaults, AttributeLimits, type AttributeLimitKey } from './domain/AttributeConstants'
export { type BaseAttributeValues, createDefaultAttributes } from './domain/AttributeValues'

// interfaces
export {
  type IAttributeModifier as AttributeModifier,
  ModifierPriority,
  type ModifierPriorityType,
  type IAttributeModifierEx as AttributeModifierEx,
} from './interfaces/AttributeModifier'
export { type AttributeType } from './interfaces/AttributeType'
export { type IAttributeCalculator } from './interfaces/IAttributeCalculator'
export { type IAttributeManager } from './interfaces/IAttributeManager'
