import { AttributeDefaults } from '@/modules/combat/infra/config'
// Base attribute type definitions
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
 * Base attribute value configuration
 *
 * All attributes are required, using explicit default values
 */
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
/**
 * Create default attribute values
 *
 * Use this function to ensure all attributes have reasonable initial values
 *
 * @param overrides Override attribute values (only set parts to customize)
 * @returns Complete attribute configuration
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
    ...overrides, // Allow overriding partial attributes
  }
}
