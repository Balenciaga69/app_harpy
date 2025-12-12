import seedrandom from 'seedrandom'
import type { ICombatRandomGenerator } from '../../../interfaces/shared/ICombatRandomGenerator'
/**
 * CombatRandomGenerator
 *
 * 種子化的戰鬥隨機數生成器。提供可重現的隨機數、整數/浮點範圍、概率檢查和種子訪問。
 */
export class CombatRandomGenerator implements ICombatRandomGenerator {
  private rng: seedrandom.PRNG
  private readonly seed: string
  constructor(seed: string | number = Date.now()) {
    this.seed = String(seed)
    this.rng = seedrandom(this.seed)
  }
  /** 產生 [0, 1) 範圍內的隨機數（類似於 Math.random()） */
  next(): number {
    return this.rng()
  }
  /** 產生 [min, max) 範圍內的隨機整數 */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min)
  }
  /** 產生 [min, max) 範圍內的隨機浮點數 */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }
  /** 返回指定概率為真的結果 */
  chance(probability: number): boolean {
    return this.next() < probability
  }
  /** 取得當前種子（用於保存/重播） */
  getSeed(): string {
    return this.seed
  }
}
