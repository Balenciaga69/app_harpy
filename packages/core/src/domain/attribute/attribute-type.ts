/**
 * AttributeType
 *
 * 定義系統中可用的屬性類型。
 * 這是最基礎的共用詞彙，所有模組都會依賴此定義。
 */
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
  | 'resurrectionChance' // 復活率 (0.03 ~ 0.50)
  | 'resurrectionHpPercent' // 復活後血量百分比 (0.10 ~ 1.00)
