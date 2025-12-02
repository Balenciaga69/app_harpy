// Public system classes
export { TickActionSystem } from './tick.action.system'
export type { ITargetSelector } from './target-select-strategies/target.selector.interface'
// Specific target selector implementations
export { FirstAliveSelector, LowestHealthSelector } from './target-select-strategies'
// Note: Do not export DamageFactory (internal tool)
