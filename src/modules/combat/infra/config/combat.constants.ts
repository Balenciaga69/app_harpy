/**
 * Combat system constants and configurations
 *
 * Design concept:
 * - Centralized management of combat-related constants
 * - Prevent magic numbers in combat logic
 * - Provide configurable values for combat balance
 */
/** Combat timing configurations */
export const CombatTiming = {
  /** Maximum ticks allowed in a combat (prevents infinite loops) */
  MAX_TICKS: 100000,
  /** Default snapshot collection interval (ticks) */
  DEFAULT_SNAPSHOT_INTERVAL: 100,
} as const
/** Energy system configurations */
export const EnergySystem = {
  /** Energy regeneration interval (ticks) */
  REGEN_INTERVAL_TICKS: 100,
} as const
/** Ultimate ability energy configurations */
export const UltimateEnergy = {
  /** Energy cost for ultimate abilities */
  COST: 100,
} as const
