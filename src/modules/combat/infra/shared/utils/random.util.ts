import seedrandom from 'seedrandom'
/**
 * CombatRandomGenerator: Reproducible pseudo-random number generator.
 *
 * Design concept:
 * - Based on seedrandom library, provides seeded random number generation to ensure reproducible results.
 * - Supports combat replay and testing, same seed produces same random sequence.
 * - Encapsulates commonly used random number generation methods, provides convenient probability judgment and range generation.
 * - As core component of CombatContext, uniformly manages all randomness in combat.
 *
 * Main responsibilities:
 * - Generate basic random numbers (floating point numbers between 0 and 1).
 * - Provide integer and floating point range random generation methods.
 * - Support probability judgment (critical judgment, evasion judgment).
 * - Save and provide seed, support saving and replaying combat status.
 */
export class CombatRandomGenerator {
  private rng: seedrandom.PRNG
  private readonly seed: string
  constructor(seed: string | number = Date.now()) {
    this.seed = String(seed)
    this.rng = seedrandom(this.seed)
  }
  /** Generate random number in [0, 1) range (similar to Math.random()) */
  next(): number {
    return this.rng()
  }
  /** Generate random integer in [min, max) range */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min)
  }
  /** Generate random float in [min, max] range */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }
  /** Return true with specified probability */
  chance(probability: number): boolean {
    return this.next() < probability
  }
  /** Get current seed (for saving/replaying) */
  getSeed(): string {
    return this.seed
  }
}
