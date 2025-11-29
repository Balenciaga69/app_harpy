import seedrandom from 'seedrandom'
/** 隨機數生成器 - 基於 seedrandom 的可重現隨機數 */
export class CombatRandomGenerator {
  private rng: seedrandom.PRNG
  private readonly seed: string
  constructor(seed: string | number = Date.now()) {
    this.seed = String(seed)
    this.rng = seedrandom(this.seed)
  }
  /** 生成 [0, 1) 範圍的隨機數（類似 Math.random()） */
  next(): number {
    return this.rng()
  }
  /** 生成 [min, max) 範圍的隨機整數 */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min)
  }
  /** 生成 [min, max] 範圍的隨機浮點數 */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }
  /** 以指定機率返回 true */
  chance(probability: number): boolean {
    return this.next() < probability
  }
  /** 獲取當前種子（用於保存/重放） */
  getSeed(): string {
    return this.seed
  }
}
