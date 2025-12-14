import type { IBettingConfig, IBracketConfig } from '../interfaces'
import { HealthBracket } from '../interfaces'

/**
 * 預設下注配置
 */
export const DEFAULT_BETTING_CONFIG: IBettingConfig = {
  brackets: [
    {
      bracket: HealthBracket.CRITICAL,
      multiplier: 8.0,
      minHealthPercent: 1,
      maxHealthPercent: 10,
    },
    {
      bracket: HealthBracket.LOW,
      multiplier: 4.0,
      minHealthPercent: 11,
      maxHealthPercent: 30,
    },
    {
      bracket: HealthBracket.MEDIUM,
      multiplier: 2.0,
      minHealthPercent: 31,
      maxHealthPercent: 60,
    },
    {
      bracket: HealthBracket.HIGH,
      multiplier: 1.2,
      minHealthPercent: 61,
      maxHealthPercent: 100,
    },
  ],
  minBetPercentOfAssets: 0.01, // 1%
  maxBetPercentOfAssets: 0.5, // 50%
  baseReward: 100, // 基礎獎勵金幣
}

/**
 * 取得區間配置
 */
export function getBracketConfig(
  bracket: HealthBracket,
  config: IBettingConfig = DEFAULT_BETTING_CONFIG
): IBracketConfig | undefined {
  return config.brackets.find((b) => b.bracket === bracket)
}

/**
 * 判斷血量百分比屬於哪個區間
 */
export function determineBracket(
  healthPercent: number,
  config: IBettingConfig = DEFAULT_BETTING_CONFIG
): HealthBracket | null {
  for (const bracket of config.brackets) {
    if (healthPercent >= bracket.minHealthPercent && healthPercent <= bracket.maxHealthPercent) {
      return bracket.bracket
    }
  }
  return null
}
