import type { ICharacter } from '../../character'

/**
 * 傷害類型
 */
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'chaos'
/**
 * 多元素傷害值
 * 記錄每種元素類型的傷害數值
 */
export interface ElementalDamages {
  physical: number
  fire: number
  ice: number
  lightning: number
  poison: number
  chaos: number
}
/**
 * 傷害事件
 * 在 DamageChain 中傳遞並被修改的數據載體
 *
 * 設計原則：
 * - 支援多元素同時存在（例如：100火焰 + 50冰霜）
 * - 可分別對每種元素應用抗性計算
 * - 元素效果根據 damages 中 > 0 的元素類型施加
 */
export interface DamageEvent {
  // === 基礎資訊 ===
  /** 攻擊者 */
  source: ICharacter
  /** 目標 */
  target: ICharacter
  // === 傷害數值（多元素） ===
  /** 各元素類型的傷害值 */
  damages: ElementalDamages
  /** 最終總傷害（所有元素加總後） */
  finalDamage: number
  // === 傷害標籤 ===
  /** 傷害標籤（例如 'attack', 'melee', 'crit', 'spell'） */
  tags: Set<string>
  // === 命中與暴擊 ===
  /** 是否暴擊 */
  isCrit: boolean
  /** 是否命中（閃避判定） */
  isHit: boolean
  // === 防禦計算 ===
  /** 是否被閃避 */
  evaded: boolean
  // === 元數據 ===
  /** 發生在哪個 Tick */
  tick: number
  /** 是否被完全阻止（例如免疫） */
  prevented: boolean
}
/**
 * 創建空的元素傷害對象
 */
export function createEmptyDamages(): ElementalDamages {
  return {
    physical: 0,
    fire: 0,
    ice: 0,
    lightning: 0,
    poison: 0,
    chaos: 0,
  }
}
/**
 * 計算總傷害
 */
export function calculateTotalDamage(damages: ElementalDamages): number {
  return damages.physical + damages.fire + damages.ice + damages.lightning + damages.poison + damages.chaos
}
