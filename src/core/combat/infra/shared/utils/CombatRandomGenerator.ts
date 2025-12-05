import seedrandom from 'seedrandom'
/**
 * CombatRandomGenerator
 *
 * Seeded random number generator for combat. Provides reproducible random, integer/float ranges, probability checks, and seed access.
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
