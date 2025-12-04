// === Core Engine ===
export { CombatEngine } from './combat-engine/CombatEngine'
// === Models (Public API) ===
export type { CombatResult, CombatSnapshot, CombatConfig } from './combat-engine/models'
// === Logger (Public API for Replay) ===
export type { CombatLogEntry } from './logic/logger'
// === Context (For advanced usage) ===
export { CombatContext } from './context/CombatContext'
export type { ICombatContext } from './context/combat-context'
/**
 * Internal modules are NOT exported:
 * - domain/ - Internal entity models
 * - logic/ - Internal calculation logic
 * - coordination/ - Internal action coordination
 * - infra/ - Internal infrastructure
 *
 * These are implementation details and should not be accessed directly.
 * All necessary functionality is exposed through CombatEngine and public models.
 */
