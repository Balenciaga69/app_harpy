/**
 * Pre-Combat Modifier 配置資料
 * 職責：定義所有可用的修飾類型、效果、刷新成本等
 * 用途：被工廠與服務層使用
 */
//TODO: AI生成內容/等待確認

import { ModifierEffect, PreCombatModifierType } from '../../domain/pre-combat/PreCombatModifier'

/**
 * 單個修飾配置項
 */
export interface PreCombatModifierConfig {
  readonly id: string
  readonly type: PreCombatModifierType
  readonly nameKey: string // i18n key for name
  readonly descriptionKey: string // i18n key for description
  readonly effect: ModifierEffect
  readonly refreshCost: number
  readonly weight: number // 用於隨機加權選擇
  readonly difficultyMinRequirement?: number // 最低難度要求
  readonly difficultyMaxRequirement?: number // 最高難度要求
  readonly tags?: ReadonlyArray<string> // 用於分類與篩選 (如 'REWARD_BOOST', 'CHALLENGE', 'DEBUFF' 等)
}

/**
 * Pre-Combat 配置集合
 * TODO: 填入實際的修飾配置
 *
 * 示例修飾類型：
 * - HEALTH_BOOST: 玩家生命值 +300
 * - ENEMY_HEALTH_BOOST: 敵人生命值 +300
 * - CARD_PENALTY: 玩家卡牌數量 -1
 * - MANA_BONUS: 玩家起始法力 +2
 * - GOLD_MULTIPLIER: 金幣獲得倍率 x1.5
 * - DOUBLE_BOSS_REWARD: 首領獎勵翻倍
 * - ENEMY_POWER_BOOST: 敵人傷害 +20%
 * 等等
 */
export const PRE_COMBAT_MODIFIER_CONFIGS: ReadonlyArray<PreCombatModifierConfig> = [
  // TODO: 根據遊戲設計填入實際配置
  /*
  {
    id: 'modifier_health_boost_player',
    type: 'HEALTH_BOOST',
    nameKey: 'preCombat.modifier.healthBoost.name',
    descriptionKey: 'preCombat.modifier.healthBoost.desc',
    effect: {
      playerHealthDelta: 300,
    },
    refreshCost: 50,
    weight: 5,
    difficultyMinRequirement: 0,
    tags: ['REWARD_BOOST'],
  },
  // ... more modifiers
  */
]

/**
 * Pre-Combat 刷新成本配置
 */
export interface PreCombatRefreshCostConfig {
  readonly baseCost: number
  readonly costMultiplierPerRefresh: number // 每次刷新後成本的倍增器
  readonly maxRefreshCount?: number // 單場戰鬥的最大刷新次數
}

/**
 * TODO: 定義刷新成本配置
 */
export const PRE_COMBAT_REFRESH_COST_CONFIG: PreCombatRefreshCostConfig = {
  baseCost: 50, // 首次刷新 50 金幣
  costMultiplierPerRefresh: 1.2, // 每次刷新成本 * 1.2
  maxRefreshCount: 5, // 最多刷新 5 次
}
