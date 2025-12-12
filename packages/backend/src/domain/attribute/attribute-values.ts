/**
 * BaseAttributeValues
 *
 * ?��?屬性數?��?置�??��?
 * ?�於定義角色?�敵人�??��?屬性�?
 */
export interface BaseAttributeValues {
  // === Health related ===
  maxHp: number
  currentHp: number // ?��??��??�常等於 maxHp
  // === Energy related ===
  maxEnergy: number
  currentEnergy: number
  energyRegen: number // �?100 tick ?�復??
  energyGainOnAttack: number // ?��??�中?��???
  // === Attack related ===
  attackDamage: number
  attackCooldown: number // ?��?：tick (100 tick = 1 sec)
  // === Defense related ===
  armor: number
  evasion: number
  accuracy: number
  // === Critical related ===
  criticalChance: number // 0-1 範�? (0.05 = 5%)
  criticalMultiplier: number // ?��? (1.5 = 150%)
  // === Resurrection related ===
  resurrectionChance: number // 0.03-0.50 範�? (3%-50%)
  resurrectionHpPercent: number // 0.10-1.00 範�? (10%-100%)
}
/**
 * 建�??�設屬性�?
 *
 * @param overrides - ?�選?�屬?��??��?
 * @returns 完整?�基礎屬?��?�?
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
    ...overrides, // ?�許覆�??��?屬�?
  }
}
