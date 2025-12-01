/**
 * 屬性系統的限制與預設值
 *
 * 設計理念：
 * - 集中管理所有屬性的預設值與上下限
 * - 提供明確的數值範圍，避免不合理的屬性值
 * - 利於粗略管理的遊戲平衡設計
 */
/** 屬性預設值 */
export const AttributeDefaults = {
  // === 生命相關 ===
  maxHp: 1000,
  currentHp: 1000,
  // === 能量相關 ===
  maxEnergy: 100,
  currentEnergy: 0,
  energyRegen: 1, // 每 100 tick 回復 1 點
  energyGainOnAttack: 3, // 普攻命中獲得 3 點
  // === 攻擊相關 ===
  attackDamage: 100,
  attackCooldown: 100, // 1 秒（100 ticks）
  // === 防禦相關 ===
  armor: 50,
  evasion: 100,
  accuracy: 100,
  // === 暴擊相關 ===
  criticalChance: 0.05, // 5%
  criticalMultiplier: 1.5, // 150%
} as const
/** 屬性上限值（用於驗證） */
export const AttributeLimits = {
  // === 生命 ===
  maxHp: { min: 1, max: 99999 },
  currentHp: { min: 0, max: 99999 },
  // === 能量 ===
  maxEnergy: { min: 1, max: 100 }, // 固定 100
  currentEnergy: { min: 0, max: 100 },
  energyRegen: { min: 0, max: 10 }, // 最多每秒回 10 點
  energyGainOnAttack: { min: 0, max: 50 },
  // === 攻擊 ===
  attackDamage: { min: 1, max: 9999 },
  attackCooldown: { min: 20, max: 500 }, // 0.2s - 5s
  // === 防禦（初始構思：不超過 1000） ===
  armor: { min: 0, max: 1000 },
  evasion: { min: 0, max: 1000 },
  accuracy: { min: 0, max: 1000 },
  // === 暴擊 ===
  criticalChance: { min: 0, max: 1 }, // 0% - 100%
  criticalMultiplier: { min: 1, max: 10 }, // 100% - 1000%
} as const
/** 屬性類型檢查 */
export type AttributeLimitKey = keyof typeof AttributeLimits
