// 基礎屬性類型
export type AttributeType =
  | 'maxHp'
  | 'currentHp'
  | 'armor'
  | 'evasion'
  | 'attackDamage'
  | 'attackCooldown'
  | 'criticalChance'
  | 'accuracy'
  | 'spellDamage'
  | 'spellCooldown'
// 基礎屬性值配置
export interface BaseAttributeValues {
  maxHp: number
  armor: number
  evasion: number
  accuracy: number
  // ... 其他屬性
}
// 屬性修飾器 (來自 Effect)
export interface AttributeModifier {
  readonly id: string
  readonly type: AttributeType
  readonly value: number
  readonly mode: 'add' | 'multiply'
  readonly source: string
}
