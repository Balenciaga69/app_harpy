// Public classes (for external use)
export { Character } from './character'
export type { EquipmentSlot } from '../item/equipment.manager'
// Public interfaces (type definitions)
export type { ICharacter } from './interfaces/character.interface'
export type { IEffectOwner } from './interfaces/effect.owner.interface'
export type { IUltimateOwner } from './interfaces/ultimate.owner.interface'
// Note: AttributeManager, EffectManager are internal implementations, not exported
