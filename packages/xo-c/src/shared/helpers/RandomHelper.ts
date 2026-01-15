import seedrandom from 'seedrandom'
export class RandomHelper {
  private rng: seedrandom.PRNG
  constructor(seed: number | string) {
    this.rng = seedrandom(seed.toString())
  }
  next(): number {
    return this.rng()
  }
}
