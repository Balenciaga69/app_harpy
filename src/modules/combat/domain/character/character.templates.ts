import { createDefaultAttributes } from './models/attribute.core.model'
import type { BaseAttributeValues } from './models/attribute.core.model'
/**
 * 角色屬性模板
 * 提供平衡的基礎屬性配置，作為無裝備無大招的角色起點
 * 這些數值是經過平衡設計的中庸標準，可作為不同職業/敵人的基準模板
 */
/**
 * 標準戰士模板
 * 特點: 高生命、中等護甲、高攻擊力、低攻速、低閃避
 * 定位: 前排坦克輸出
 */
export function createWarriorTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 1200,
    currentHp: 1200,
    armor: 80, // 約 44% 減傷
    evasion: 50,
    accuracy: 150,
    attackDamage: 120,
    attackCooldown: 100, // 1 秒/次
    criticalChance: 0.1, // 10%
    criticalMultiplier: 1.5,
    energyGainOnAttack: 4, // 約 25 次攻擊釋放大招
  })
}
/**
 * 標準射手模板
 * 特點: 中等生命、低護甲、高閃避、中等攻擊力、高攻速、高暴擊
 * 定位: 後排高頻輸出
 */
export function createArcherTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 800,
    currentHp: 800,
    armor: 30, // 約 23% 減傷
    evasion: 120,
    accuracy: 180,
    attackDamage: 90,
    attackCooldown: 80, // 0.8 秒/次
    criticalChance: 0.15, // 15%
    criticalMultiplier: 2.0,
    energyGainOnAttack: 5, // 約 20 次攻擊釋放大招
  })
}
/**
 * 標準法師模板
 * 特點: 低生命、極低護甲、中等閃避、高攻擊力、中等攻速、極高暴傷
 * 定位: 後排爆發輸出
 */
export function createMageTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 700,
    currentHp: 700,
    armor: 15, // 約 13% 減傷
    evasion: 80,
    accuracy: 140,
    attackDamage: 150,
    attackCooldown: 120, // 1.2 秒/次
    criticalChance: 0.12, // 12%
    criticalMultiplier: 2.5, // 高暴傷
    energyGainOnAttack: 6, // 約 17 次攻擊釋放大招
  })
}
/**
 * 標準刺客模板
 * 特點: 低生命、低護甲、極高閃避、極高攻速、極高暴擊
 * 定位: 高機動爆發刺殺
 */
export function createAssassinTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 650,
    currentHp: 650,
    armor: 20, // 約 17% 減傷
    evasion: 180,
    accuracy: 200,
    attackDamage: 80,
    attackCooldown: 60, // 0.6 秒/次（極高攻速）
    criticalChance: 0.25, // 25%
    criticalMultiplier: 2.2,
    energyGainOnAttack: 5, // 約 20 次攻擊釋放大招
  })
}
/**
 * 標準坦克模板
 * 特點: 極高生命、極高護甲、低攻擊力、低攻速、低閃避
 * 定位: 純肉盾吸收傷害
 */
export function createTankTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 1600,
    currentHp: 1600,
    armor: 150, // 約 60% 減傷
    evasion: 30,
    accuracy: 120,
    attackDamage: 60,
    attackCooldown: 150, // 1.5 秒/次
    criticalChance: 0.05, // 5%
    criticalMultiplier: 1.3,
    energyGainOnAttack: 3, // 約 33 次攻擊釋放大招
  })
}
/**
 * 標準小怪模板
 * 特點: 低生命、低護甲、低攻擊力、中等攻速
 * 定位: 基礎雜兵
 */
export function createMinionTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 600,
    currentHp: 600,
    armor: 20, // 約 17% 減傷
    evasion: 80,
    accuracy: 120,
    attackDamage: 50,
    attackCooldown: 120, // 1.2 秒/次
    criticalChance: 0.08, // 8%
    energyGainOnAttack: 3, // 約 33 次攻擊釋放大招
  })
}
/**
 * 標準精英怪模板
 * 特點: 中等生命、中等護甲、高攻擊力、中等攻速
 * 定位: 小 Boss
 */
export function createEliteTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 1500,
    currentHp: 1500,
    armor: 60, // 約 38% 減傷
    evasion: 100,
    accuracy: 160,
    attackDamage: 140,
    attackCooldown: 100, // 1 秒/次
    criticalChance: 0.15, // 15%
    criticalMultiplier: 1.8,
    energyGainOnAttack: 5, // 約 20 次攻擊釋放大招
  })
}
/**
 * 標準 Boss 模板
 * 特點: 極高生命、高護甲、極高攻擊力、低攻速、高暴擊
 * 定位: 首領級敵人
 */
export function createBossTemplate(): BaseAttributeValues {
  return createDefaultAttributes({
    maxHp: 3000,
    currentHp: 3000,
    armor: 120, // 約 55% 減傷
    evasion: 120,
    accuracy: 180,
    attackDamage: 200,
    attackCooldown: 150, // 1.5 秒/次
    criticalChance: 0.2, // 20%
    criticalMultiplier: 2.0,
    energyGainOnAttack: 8, // 約 12-13 次攻擊釋放大招
  })
}
/**
 * 平衡測試用模板
 * 特點: 所有屬性都是預設值，用於測試基礎機制
 * 定位: 測試基準
 */
export function createBalancedTemplate(): BaseAttributeValues {
  return createDefaultAttributes() // 使用完全預設值
}
