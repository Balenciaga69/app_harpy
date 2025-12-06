/**
 * AttributeType
 *
 * Defines the types of attributes available in the system.
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
