// Public system classes
export { AbilitySystem } from './ability-system'
// Public interfaces
export type { IUltimateAbility, UltimateType } from './ability-system/ultimate'
export type { ITargetSelector } from './ability-system/target-select-strategies/target.selector.interface'
// Specific target selector implementations
export { FirstAliveSelector, LowestHealthSelector } from './ability-system/target-select-strategies'
// Ultimate implementations (exported for character configuration)
export { SimpleDamageUltimate, ThunderStrikeUltimate, BloodPactUltimate } from './ability-system/ultimate'
// Note: Do not export DamageFactory (internal tool)
