// Public system classes
export { AbilitySystem } from './ability.system'
// Public interfaces
export type { IUltimateAbility } from './models/ultimate.ability.interface'
export type { ITargetSelector } from './target-select-strategies/target.selector.interface'
// Specific target selector implementations
export { FirstAliveSelector, LowestHealthSelector } from './target-select-strategies'
// Note: Do not export concrete implementations like SimpleDamageUltimate, ThunderStrikeUltimate, etc.
// Note: Do not export DamageFactory (internal tool)
