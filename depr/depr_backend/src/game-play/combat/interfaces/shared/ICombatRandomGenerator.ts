/**
 * ICombatRandomGenerator
 *
 * Interface for combat random number generator.
 * Provides deterministic random numbers for combat calculations.
 */
export interface ICombatRandomGenerator {
  /** Generate random number in [0, 1) range (similar to Math.random()) */
  next(): number
  /** Generate random integer in [min, max) range */
  nextInt(min: number, max: number): number
  /** Generate random float in [min, max) range */
  nextFloat(min: number, max: number): number
  /** Return true with given probability */
  chance(probability: number): boolean
  /** Get current seed (for save/replay) */
  getSeed(): string
}
