// 公共系統類
export { AbilitySystem } from './ability.system'
// 公共接口
export type { IUltimateAbility } from './models/ultimate.ability.interface'
export type { ITargetSelector } from './target-select-strategies/target.selector.interface'
// 具體的目標選擇器實現
export { FirstAliveSelector, LowestHealthSelector } from './target-select-strategies'
// 注意：不導出 SimpleDamageUltimate、ThunderStrikeUltimate 等具體實現
// 注意：不導出 DamageFactory（內部工具）
