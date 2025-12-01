import { AttributeDefaults } from '@/modules/combat/infra/config'
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
/**
 * 基礎屬性值配置
 *
 * 所有屬性都是必填，使用明確的預設值
 */
export interface BaseAttributeValues {
  // === 生命相關 ===
  maxHp: number
  currentHp: number // 初始化時通常等於 maxHp
  // === 能量相關 ===
  maxEnergy: number
  currentEnergy: number
  energyRegen: number // 每 100 tick 回復量
  energyGainOnAttack: number // 普攻命中獲得量
  // === 攻擊相關 ===
  attackDamage: number
  attackCooldown: number // 單位：tick (100 tick = 1 sec)
  // === 防禦相關 ===
  armor: number
  evasion: number
  accuracy: number
  // === 暴擊相關 ===
  criticalChance: number // 0-1 範圍 (0.05 = 5%)
  criticalMultiplier: number // 倍率 (1.5 = 150%)
}
/**
 * 建立預設屬性值
 *
 * 使用此函數確保所有屬性都有合理的初始值
 *
 * @param overrides 覆寫的屬性值（僅設置需要自訂的部分）
 * @returns 完整的屬性配置
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
    ...overrides, // 允許覆寫部分屬性
  }
}
