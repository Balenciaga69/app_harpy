import { AttributeDefaults } from './AttributeConstants'
import type { IBaseAttributeValues } from '../interfaces/IBaseAttributeValues'
/** @deprecated 請使用 IBaseAttributeValues */
export type BaseAttributeValues = IBaseAttributeValues
export function createDefaultAttributes(overrides?: Partial<IBaseAttributeValues>): IBaseAttributeValues {
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
    ...overrides, // 允許覆蓋預設屬性
  }
}
