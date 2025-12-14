import Chance from 'chance'
import type { IRNGService } from '../interfaces'

/**
 * RNG 服務實作
 *
 * 使用 Chance.js 提供確定性隨機數生成
 */
export class RNGService implements IRNGService {
  private chance: Chance.Chance
  private seed: string | number

  constructor(seed: string | number) {
    this.seed = seed
    this.chance = new Chance(String(seed))
  }

  /* 生成隨機整數 */
  integer(min: number, max: number): number {
    return this.chance.integer({ min, max })
  }

  /* 生成隨機浮點數 */
  float(min = 0, max = 1): number {
    return this.chance.floating({ min, max })
  }

  /* 從陣列中隨機選擇 */
  pick<T>(array: T[]): T {
    return this.chance.pickone(array)
  }

  /* 權重隨機選擇 */
  weighted<T>(items: T[], weights: number[]): T {
    return this.chance.weighted(items, weights)
  }

  /* 取得當前種子 */
  getSeed(): string | number {
    return this.seed
  }
}
