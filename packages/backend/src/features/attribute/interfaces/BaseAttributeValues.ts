/**
 * 基礎屬性值介面
 *
 * 定義角色的所有基礎數值屬性
 */
export interface BaseAttributeValues {
  /** Health related */
  maxHp: number
  currentHp: number
  /** Energy related */
  maxEnergy: number
  currentEnergy: number
  energyRegen: number
  energyGainOnAttack: number
  /** Attack related */
  attackDamage: number
  attackCooldown: number
  /** Defense related */
  armor: number
  evasion: number
  accuracy: number
  /** Critical related */
  criticalChance: number
  criticalMultiplier: number
  /** Resurrection related */
  resurrectionChance: number
  resurrectionHpPercent: number
}
