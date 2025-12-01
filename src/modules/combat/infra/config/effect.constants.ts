/**
 * Effect system constants and configurations
 *
 * Design concept:
 * - Centralized management of effect names and default values
 * - Prevent hardcoding of effect names throughout the codebase
 * - Provide clear effect configurations for balance adjustments
 */
/** Effect name constants (to replace hardcoded strings) */
export const EffectNames = {
  // === Native status effects ===
  CHARGE: 'Charge',
  HOLY_FIRE: 'Holy Fire',
  CHILL: 'Chill',
  POISON: 'Poison',
  // === Equipment effects ===
  CHARGED_CRITICAL: 'Charged Critical',
} as const

/** Effect type constants */
export const EffectTypes = {
  NATIVE_STATUS: 'native-status',
  EQUIPMENT: 'equipment',
  TEMPORARY: 'temporary',
} as const

/** Charge effect configurations */
export const ChargeEffectConfig = {
  /** Cooldown reduction per stack (4% per stack) */
  COOLDOWN_REDUCTION_PER_STACK: 0.04,
  /** Decay rate per second (10% per second) */
  DECAY_RATE_PER_SECOND: 0.1,
  /** Maximum stacks */
  MAX_STACKS: 16,
} as const
