// Public system classes
export { TickActionSystem } from './TickActionSystem'
// Specific target selector implementations
export { FirstAliveSelector } from './target-select-strategies/FirstAliveSelector'
export { LowestHealthSelector } from './target-select-strategies/LowestHealthSelector'
export type { ITargetSelector } from './target-select-strategies/target-selector'
// Note: Do not export DamageFactory (internal tool)
