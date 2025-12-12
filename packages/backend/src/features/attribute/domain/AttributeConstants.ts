/** 屬性預設值 */
export const AttributeDefaults = {
  // === Health related ===
  maxHp: 1000,
  currentHp: 1000,
  // === Energy related ===
  maxEnergy: 100,
  currentEnergy: 0,
  energyRegen: 1, // 每 100 tick 恢復 1 點
  energyGainOnAttack: 3, // 普通攻擊命中獲得 3 點
  // === Attack related ===
  attackDamage: 100,
  attackCooldown: 100, // 1 秒 (100 tick)
  // === Defense related ===
  armor: 50,
  evasion: 100,
  accuracy: 100,
  // === Critical related ===
  criticalChance: 0.05, // 5%
  criticalMultiplier: 1.5, // 150%
  // === Resurrection related ===
  resurrectionChance: 0.05, // 預設 5%
  resurrectionHpPercent: 0.1, // 復活後恢復 10% HP
} as const
/** 屬性上下限（用於驗證） */
export const AttributeLimits = {
  // === Health ===
  maxHp: { min: 1, max: 99999 },
  currentHp: { min: 0, max: 99999 },
  // === Energy ===
  maxEnergy: { min: 1, max: 100 }, // 固定為 100
  currentEnergy: { min: 0, max: 100 },
  energyRegen: { min: 0, max: 10 }, // 最多每秒恢復 10 點
  energyGainOnAttack: { min: 0, max: 50 },
  // === Attack ===
  attackDamage: { min: 1, max: 9999 },
  attackCooldown: { min: 20, max: 500 }, // 0.2s - 5s
  // === Defense ===
  armor: { min: 0, max: 1000 },
  evasion: { min: 0, max: 1000 },
  accuracy: { min: 0, max: 1000 },
  // === Critical ===
  criticalChance: { min: 0, max: 1 }, // 0% - 100%
  criticalMultiplier: { min: 1, max: 10 }, // 100% - 1000%
  // === Resurrection ===
  resurrectionChance: { min: 0.03, max: 0.5 }, // 3% - 50%
  resurrectionHpPercent: { min: 0.1, max: 1 }, // 10% - 100%
} as const
/** 屬性類型檢查 */
export type AttributeLimitKey = keyof typeof AttributeLimits
