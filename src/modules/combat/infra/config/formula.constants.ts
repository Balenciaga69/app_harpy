/**
 * Game formula related coefficients and configurations
 *
 * Design concept:
 * - Centralized management of all game formula coefficients
 * - Provide calculation methods to ensure formula consistency
 * - Facilitate game balance adjustments
 */
/** Armor reduction formula configuration */
export const ArmorFormula = {
  /** K coefficient (suggested value: 100) */
  K_COEFFICIENT: 100,
  /** Maximum reduction rate (avoid invincibility) */
  MAX_REDUCTION: 0.9, // 90%
  /**
   * Calculate reduction rate: armor / (armor + K)
   * @param armor Armor value
   * @returns Reduction rate (0-0.9)
   */
  calculate(armor: number): number {
    if (armor <= 0) return 0
    const reduction = armor / (armor + this.K_COEFFICIENT)
    return Math.min(this.MAX_REDUCTION, Math.max(0, reduction))
  },
} as const
/** Evasion mechanism configuration */
export const EvasionFormula = {
  /** Evasion rate calculation divider */
  DIVIDER: 100,
  /** Minimum evasion rate */
  MIN_EVASION_RATE: 0.05, // 5%
  /** Maximum evasion rate */
  MAX_EVASION_RATE: 0.8, // 80%
  /** Coefficient penalty after evasion success */
  SUCCESS_PENALTY: 0.8,
  /** Coefficient recovery after evasion failure */
  FAILURE_RESET: 1.0,
  /**
   * Calculate evasion rate: (evasion - accuracy) / 100
   * @param evasion Evasion value
   * @param accuracy Accuracy value
   * @returns Evasion rate (0.05-0.8)
   */
  calculate(evasion: number, accuracy: number): number {
    const rate = (evasion - accuracy) / this.DIVIDER
    return Math.min(this.MAX_EVASION_RATE, Math.max(this.MIN_EVASION_RATE, rate))
  },
} as const
/** Critical mechanism configuration */
export const CriticalFormula = {
  /** Default critical multiplier */
  DEFAULT_MULTIPLIER: 1.5,
  /**
   * Calculate critical damage
   * @param baseDamage Base damage
   * @param critMultiplier Critical multiplier (default 1.5)
   * @returns Damage after critical
   */
  calculate(baseDamage: number, critMultiplier?: number): number {
    const multiplier = critMultiplier ?? this.DEFAULT_MULTIPLIER
    return baseDamage * multiplier
  },
} as const
/** Energy system configuration */
export const EnergyConfig = {
  /** Ultimate energy cost */
  ULTIMATE_COST: 100,
  /** Energy regen interval (ticks) */
  REGEN_INTERVAL: 100, // Every 100 ticks = 1 second
} as const
/** Tick time configuration */
export const TickConfig = {
  /** Ticks per second */
  TICKS_PER_SECOND: 100,
  /**
   * Convert ticks to seconds
   * @param ticks Number of ticks
   * @returns Number of seconds
   */
  toSeconds(ticks: number): number {
    return ticks / this.TICKS_PER_SECOND
  },
  /**
   * Convert seconds to ticks
   * @param seconds Number of seconds
   * @returns Number of ticks
   */
  fromSeconds(seconds: number): number {
    return seconds * this.TICKS_PER_SECOND
  },
} as const
