// 基礎屬性類型定義
export type AttributeType =
  | 'maxHp'
  | 'currentHp'
  | 'armor'
  | 'evasion'
  | 'attackDamage'
  | 'attackCooldown'
  | 'criticalChance'
  | 'criticalMultiplier'
  | 'accuracy'
  | 'spellDamage'
  | 'spellCooldown'
// 基礎屬性值配置
export interface BaseAttributeValues {
  maxHp: number
  armor: number
  evasion: number
  accuracy: number
  attackDamage?: number
  attackCooldown?: number
  criticalChance?: number
  criticalMultiplier?: number
  spellDamage?: number
  spellCooldown?: number
}
