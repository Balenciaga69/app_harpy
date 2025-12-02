// Public classes (for external use)
export { Character } from './character'
export type { EquipmentSlot } from '../item/equipment.manager'
// Public interfaces (type definitions)
export type { ICharacter } from './interfaces/character.interface'
export type { IAttributeProvider } from './interfaces/attribute.provider.interface'
export type { IEffectOwner } from './interfaces/effect.owner.interface'
export type { IUltimateOwner } from './interfaces/ultimate.owner.interface'
// Public types (attribute related)
export type { AttributeType } from './models/attribute.core.model'
export type { AttributeModifier } from './models/attribute.modifier.model'
export type { BaseAttributeValues } from './models/attribute.core.model'
// Note: AttributeContainer and AttributeCalculator are internal implementations, not exported
// Note: EffectManager is also internal implementation, not exported
