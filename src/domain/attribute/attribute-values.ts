import { AttributeDefaults } from './attribute-constants'
/**
 * BaseAttributeValues
 *
 * 基礎屬性數值配置介面。
 * 用於定義角色、敵人的基礎屬性。
 */
export interface BaseAttributeValues {
  // === Health related ===
  maxHp: number
  currentHp: number // 初始化時通常等於 maxHp
  // === Energy related ===
  maxEnergy: number
  currentEnergy: number
  energyRegen: number // 每 100 tick 恢復量
  energyGainOnAttack: number // 攻擊命中獲得量
  // === Attack related ===
  attackDamage: number
  attackCooldown: number // 單位：tick (100 tick = 1 sec)
  // === Defense related ===
  armor: number
  evasion: number
  accuracy: number
  // === Critical related ===
  criticalChance: number // 0-1 範圍 (0.05 = 5%)
  criticalMultiplier: number // 倍率 (1.5 = 150%)
  // === Resurrection related ===
  resurrectionChance: number // 0.03-0.50 範圍 (3%-50%)
  resurrectionHpPercent: number // 0.10-1.00 範圍 (10%-100%)
}
/**
 * 建立預設屬性值
 *
 * @param overrides - 可選的屬性覆蓋值
 * @returns 完整的基礎屬性配置
 */
export function createDefaultAttributes(overrides?: Partial<BaseAttributeValues>): BaseAttributeValues {
  return {
    maxHp: AttributeDefaults.maxHp,
    currentHp: AttributeDefaults.currentHp,
    maxEnergy: AttributeDefaults.maxEnergy,
    currentEnergy: AttributeDefaults.currentEnergy,
    energyRegen: AttributeDefaults.energyRegen,
    energyGainOnAttack: AttributeDefaults.energyGainOnAttack,
    attackDamage: AttributeDefaults.attackDamage,
    attackCooldown: AttributeDefaults.attackCooldown,
    armor: AttributeDefaults.armor,
    evasion: AttributeDefaults.evasion,
    accuracy: AttributeDefaults.accuracy,
    criticalChance: AttributeDefaults.criticalChance,
    criticalMultiplier: AttributeDefaults.criticalMultiplier,
    resurrectionChance: AttributeDefaults.resurrectionChance,
    resurrectionHpPercent: AttributeDefaults.resurrectionHpPercent,
    ...overrides, // 允許覆蓋部分屬性
  }
}
