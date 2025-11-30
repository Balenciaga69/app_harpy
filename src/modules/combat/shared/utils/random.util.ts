import seedrandom from 'seedrandom'
/**
 * CombatRandomGenerator：可重現的偽隨機數生成器。
 *
 * 設計理念：
 * - 基於 seedrandom 庫，提供種子化的隨機數生成，確保結果可重現。
 * - 支援戰鬥回放與測試，相同種子產生相同的隨機序列。
 * - 封裝常用的隨機數生成方法，提供便捷的機率判斷與範圍生成。
 * - 作為 CombatContext 的核心元件，統一管理戰鬥中的所有隨機性。
 *
 * 主要職責：
 * - 生成基礎隨機數（0 到 1 之間的浮點數）。
 * - 提供整數與浮點數的範圍隨機生成方法。
 * - 支援機率判斷（如暴擊判定、閃避判定）。
 * - 保存與提供種子，支援戰鬥狀態的保存與重放。
 */
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
