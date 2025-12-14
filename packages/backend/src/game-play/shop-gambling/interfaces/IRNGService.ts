/**
 * RNG 服務介面
 *
 * 提供確定性隨機數生成
 */
export interface IRNGService {
  /**
   * 生成隨機整數
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @returns 隨機整數
   */
  integer(min: number, max: number): number

  /**
   * 生成隨機浮點數
   * @param min 最小值（包含）
   * @param max 最大值（不包含）
   * @returns 隨機浮點數
   */
  float(min?: number, max?: number): number

  /**
   * 從陣列中隨機選擇
   * @param array 陣列
   * @returns 隨機元素
   */
  pick<T>(array: T[]): T

  /**
   * 權重隨機選擇
   * @param items 項目陣列
   * @param weights 權重陣列
   * @returns 選中的項目
   */
  weighted<T>(items: T[], weights: number[]): T

  /**
   * 取得當前種子
   */
  getSeed(): string | number
}
