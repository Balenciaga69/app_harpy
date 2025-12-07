import { createDefaultAttributes } from '@/domain/attribute'
import type { BaseAttributeValues } from '@/domain/attribute'
/**
 * Character attribute templates
 * Provide balanced base attribute configurations as starting point for characters without equipment or ultimates
 * These values are designed for balance and serve as baseline templates for different classes/enemies
 */
/**
 * Standard Warrior Template
 * Features: High HP, medium armor, high attack damage, low attack speed, low evasion
 * Positioning: Front-line tank output
 */
export function createWarriorTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 1200,
    currentHp: 1200,
    armor: 80, // ~44% damage reduction
    evasion: 50,
    accuracy: 150,
    attackDamage: 120,
    attackCooldown: 100, // 1 sec/attack
    criticalChance: 0.1, // 10%
    criticalMultiplier: 1.5,
    energyGainOnAttack: 4, // ~25 attacks to release ultimate
  })
}
/**
 * Standard Archer Template
 * Features: Medium HP, low armor, high evasion, medium attack damage, high attack speed, high crit
 * Positioning: Back-line high-frequency output
 */
export function createArcherTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 800,
    currentHp: 800,
    armor: 30, // ~23% damage reduction
    evasion: 120,
    accuracy: 180,
    attackDamage: 90,
    attackCooldown: 80, // 0.8 sec/attack
    criticalChance: 0.15, // 15%
    criticalMultiplier: 2.0,
    energyGainOnAttack: 5, // ~20 attacks to release ultimate
  })
}
/**
 * Standard Mage Template
 * Features: Low HP, very low armor, medium evasion, high attack damage, medium attack speed, very high crit damage
 * Positioning: Back-line burst output
 */
export function createMageTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 700,
    currentHp: 700,
    armor: 15, // ~13% damage reduction
    evasion: 80,
    accuracy: 140,
    attackDamage: 150,
    attackCooldown: 120, // 1.2 sec/attack
    criticalChance: 0.12, // 12%
    criticalMultiplier: 2.5, // High crit damage
    energyGainOnAttack: 6, // ~17 attacks to release ultimate
  })
}
/**
 * Standard Assassin Template
 * Features: Low HP, low armor, very high evasion, very high attack speed, very high crit
 * Positioning: High mobility burst assassination
 */
export function createAssassinTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 650,
    currentHp: 650,
    armor: 20, // ~17% damage reduction
    evasion: 120,
    accuracy: 200,
    attackDamage: 80,
    attackCooldown: 60, // 0.6 sec/attack (very high attack speed)
    criticalChance: 0.25, // 25%
    criticalMultiplier: 2.2,
    energyGainOnAttack: 5, // ~20 attacks to release ultimate
  })
}
/**
 * Standard Tank Template
 * Features: Very high HP, very high armor, low attack damage, low attack speed, low evasion
 * Positioning: Pure meat shield absorbing damage
 */
export function createTankTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 1600,
    currentHp: 1600,
    armor: 150, // ~60% damage reduction
    evasion: 30,
    accuracy: 120,
    attackDamage: 60,
    attackCooldown: 150, // 1.5 sec/attack
    criticalChance: 0.05, // 5%
    criticalMultiplier: 1.3,
    energyGainOnAttack: 3, // ~33 attacks to release ultimate
  })
}
/**
 * Standard Minion Template
 * Features: Low HP, low armor, low attack damage, medium attack speed
 * Positioning: Basic miscellaneous troops
 */
export function createMinionTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 600,
    currentHp: 600,
    armor: 20, // ~17% damage reduction
    evasion: 80,
    accuracy: 120,
    attackDamage: 50,
    attackCooldown: 120, // 1.2 sec/attack
    criticalChance: 0.08, // 8%
    energyGainOnAttack: 3, // ~33 attacks to release ultimate
  })
}
/**
 * Standard Elite Template
 * Features: Medium HP, medium armor, high attack damage, medium attack speed
 * Positioning: Small Boss
 */
export function createEliteTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 1500,
    currentHp: 1500,
    armor: 60, // ~38% damage reduction
    evasion: 100,
    accuracy: 160,
    attackDamage: 140,
    attackCooldown: 100, // 1 sec/attack
    criticalChance: 0.15, // 15%
    criticalMultiplier: 1.8,
    energyGainOnAttack: 5, // ~20 attacks to release ultimate
  })
}
/**
 * Standard Boss Template
 * Features: Very high HP, high armor, very high attack damage, low attack speed, high crit
 * Positioning: Leader-level enemies
 */
export function createBossTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 3000,
    currentHp: 3000,
    armor: 120, // ~55% damage reduction
    evasion: 120,
    accuracy: 180,
    attackDamage: 200,
    attackCooldown: 150, // 1.5 sec/attack
    criticalChance: 0.2, // 20%
    criticalMultiplier: 2.0,
    energyGainOnAttack: 8, // ~12-13 attacks to release ultimate
  })
}
/**
 * Balance test template
 * Features: All attributes are default values, used for testing basic mechanisms
 * Positioning: Test baseline
 */
export function createBalancedTemplate(): BaseAttributeValues {
  return createDefaultAttributes() // Use completely default values
}
