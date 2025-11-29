import seedrandom from 'seedrandom'
/**
 * 戰鬥隨機數生成器 - 基於 seedrandom 的可重現隨機數
 *
 * 提供可重現的隨機數生成，使戰鬥可以通過相同的 seed 完全重放
 */
class CombatRandomGenerator {
  private rng: seedrandom.PRNG
  private currentSeed: string
  constructor(seed: string | number = Date.now()) {
    this.currentSeed = String(seed)
    this.rng = seedrandom(this.currentSeed)
  }
  /**
   * 生成 [0, 1) 範圍的隨機數（類似 Math.random()）
   */
  next(): number {
    return this.rng()
  }
  /**
   * 生成 [min, max) 範圍的隨機整數
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min)
  }
  /**
   * 重置隨機數生成器的種子
   */
  reset(seed: string | number): void {
    this.currentSeed = String(seed)
    this.rng = seedrandom(this.currentSeed)
  }
  /**
   * 獲取當前種子（用於保存/重放）
   */
  getSeed(): string {
    return this.currentSeed
  }
}
/**
 * 全局戰鬥隨機數生成器實例
 * 由 CombatStatusStore 管理其 seed
 */
export const combatRandom = new CombatRandomGenerator()
