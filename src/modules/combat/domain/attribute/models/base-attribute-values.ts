/**
 * BaseAttributeValues
 *
 * Represents the configuration for base attribute values.
 */
import { AttributeDefaults } from '@/modules/combat/infra/config'
export interface BaseAttributeValues {
  // === Health related ===
  maxHp: number
  currentHp: number // Usually equals maxHp during initialization
  // === Energy related ===
  maxEnergy: number
  currentEnergy: number
  energyRegen: number // Regen amount per 100 ticks
  energyGainOnAttack: number // Amount gained on attack hit
  // === Attack related ===
  attackDamage: number
  attackCooldown: number // Unit: tick (100 tick = 1 sec)
  // === Defense related ===
  armor: number
  evasion: number
  accuracy: number
  // === Critical related ===
  criticalChance: number // 0-1 range (0.05 = 5%)
  criticalMultiplier: number // Multiplier (1.5 = 150%)
}
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
    ...overrides, // Allow overriding partial attributes
  }
}
