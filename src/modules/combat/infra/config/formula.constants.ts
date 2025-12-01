/**
 * 遊戲公式相關的係數與配置
 *
 * 設計理念：
 * - 集中管理所有遊戲公式的係數
 * - 提供計算方法，確保公式一致性
 * - 便於調整遊戲平衡
 */
/** 護甲減免公式配置 */
export const ArmorFormula = {
  /** K 係數（建議值：100） */
  K_COEFFICIENT: 100,
  /** 最大減免率（避免無敵） */
  MAX_REDUCTION: 0.9, // 90%
  /**
   * 計算減免率：armor / (armor + K)
   * @param armor 護甲值
   * @returns 減免率 (0-0.9)
   */
  calculate(armor: number): number {
    if (armor <= 0) return 0
    const reduction = armor / (armor + this.K_COEFFICIENT)
    return Math.min(this.MAX_REDUCTION, Math.max(0, reduction))
  },
} as const
/** 閃避機制配置 */
export const EvasionFormula = {
  /** 閃避率計算除數 */
  DIVIDER: 100,
  /** 最小閃避率 */
  MIN_EVASION_RATE: 0.05, // 5%
  /** 最大閃避率 */
  MAX_EVASION_RATE: 0.8, // 80%
  /** 閃避成功後的係數懲罰 */
  SUCCESS_PENALTY: 0.8,
  /** 閃避失敗後係數恢復 */
  FAILURE_RESET: 1.0,
  /**
   * 計算閃避率：(evasion - accuracy) / 100
   * @param evasion 閃避值
   * @param accuracy 命中值
   * @returns 閃避率 (0.05-0.8)
   */
  calculate(evasion: number, accuracy: number): number {
    const rate = (evasion - accuracy) / this.DIVIDER
    return Math.min(this.MAX_EVASION_RATE, Math.max(this.MIN_EVASION_RATE, rate))
  },
} as const
/** 暴擊機制配置 */
export const CriticalFormula = {
  /** 預設暴擊倍率 */
  DEFAULT_MULTIPLIER: 1.5,
  /**
   * 計算暴擊傷害
   * @param baseDamage 基礎傷害
   * @param critMultiplier 暴擊倍率（預設 1.5）
   * @returns 暴擊後的傷害
   */
  calculate(baseDamage: number, critMultiplier?: number): number {
    const multiplier = critMultiplier ?? this.DEFAULT_MULTIPLIER
    return baseDamage * multiplier
  },
} as const
/** 能量系統配置 */
export const EnergyConfig = {
  /** 大招消耗能量 */
  ULTIMATE_COST: 100,
  /** 能量回復間隔（ticks） */
  REGEN_INTERVAL: 100, // 每 100 tick = 1 秒
} as const
/** Tick 時間配置 */
export const TickConfig = {
  /** 每秒的 Tick 數 */
  TICKS_PER_SECOND: 100,
  /**
   * Tick 轉秒
   * @param ticks Tick 數
   * @returns 秒數
   */
  toSeconds(ticks: number): number {
    return ticks / this.TICKS_PER_SECOND
  },
  /**
   * 秒轉 Tick
   * @param seconds 秒數
   * @returns Tick 數
   */
  fromSeconds(seconds: number): number {
    return seconds * this.TICKS_PER_SECOND
  },
} as const
