// 基礎屬性類型定義
export type AttributeType =
  | 'maxHp'
  | 'currentHp'
  | 'maxEnergy'
  | 'currentEnergy'
  | 'energyRegen'
  | 'energyGainOnAttack'
  | 'armor'
  | 'evasion'
  | 'attackDamage'
  | 'attackCooldown'
  | 'criticalChance'
  | 'criticalMultiplier'
  | 'accuracy'
// 基礎屬性值配置
export interface BaseAttributeValues {
  maxHp: number
  maxEnergy: number
  energyRegen: number
  energyGainOnAttack: number
  armor: number
  evasion: number
  accuracy: number
  attackDamage?: number
  attackCooldown?: number
  criticalChance?: number
  criticalMultiplier?: number
}
