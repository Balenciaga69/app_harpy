/**
 * Attribute system limits and default values
 *
 * Design concept:
 * - Centralized management of all attribute default values and limits
 * - Provide clear value ranges to avoid unreasonable attribute values
 * - Facilitate rough game balance design
 */
/** Attribute default values */
export const AttributeDefaults = {
  // === Health related ===
  maxHp: 1000,
  currentHp: 1000,
  // === Energy related ===
  maxEnergy: 100,
  currentEnergy: 0,
  energyRegen: 1, // Regen 1 point every 100 ticks
  energyGainOnAttack: 3, // Gain 3 points on normal attack hit
  // === Attack related ===
  attackDamage: 100,
  attackCooldown: 100, // 1 second (100 ticks)
  // === Defense related ===
  armor: 50,
  evasion: 100,
  accuracy: 100,
  // === Critical related ===
  criticalChance: 0.05, // 5%
  criticalMultiplier: 1.5, // 150%
} as const
/** Attribute upper limits (for validation) */
export const AttributeLimits = {
  // === Health ===
  maxHp: { min: 1, max: 99999 },
  currentHp: { min: 0, max: 99999 },
  // === Energy ===
  maxEnergy: { min: 1, max: 100 }, // Fixed at 100
  currentEnergy: { min: 0, max: 100 },
  energyRegen: { min: 0, max: 10 }, // Max regen 10 points per second
  energyGainOnAttack: { min: 0, max: 50 },
  // === Attack ===
  attackDamage: { min: 1, max: 9999 },
  attackCooldown: { min: 20, max: 500 }, // 0.2s - 5s
  // === Defense (initial concept: not exceeding 1000) ===
  armor: { min: 0, max: 1000 },
  evasion: { min: 0, max: 1000 },
  accuracy: { min: 0, max: 1000 },
  // === Critical ===
  criticalChance: { min: 0, max: 1 }, // 0% - 100%
  criticalMultiplier: { min: 1, max: 10 }, // 100% - 1000%
} as const
/** Attribute type checking */
export type AttributeLimitKey = keyof typeof AttributeLimits
