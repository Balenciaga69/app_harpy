/**
 * Ultimate ability related constants and configurations
 *
 * Design concept:
 * - Centralized management of ultimate ability default values and configurations
 * - Provide clear value ranges to avoid unreasonable ultimate settings
 * - Facilitate game balance adjustments for ultimate abilities
 */
/** Ultimate ability default configurations */
export const UltimateDefaults = {
  // === Damage related ===
  defaultDamageMultiplier: 3, // Default ultimate damage multiplier
  thunderStrikeDamageMultiplier: 2, // Thunder strike specific multiplier
  simpleDamageMultiplier: 3, // Simple damage ultimate multiplier
  // === Charge related ===
  thunderStrikeChargeStacks: 6, // Thunder strike charge stacks
} as const
/** Ultimate ability limits (for validation) */
export const UltimateLimits = {
  // === Damage multiplier ===
  damageMultiplier: { min: 1, max: 10 }, // 1x - 10x damage
  // === Charge stacks ===
  chargeStacks: { min: 1, max: 50 }, // 1 - 50 stacks
} as const
