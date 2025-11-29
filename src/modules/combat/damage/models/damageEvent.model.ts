import type { ICharacter } from '../../character/models/character.model'
/**
 * 傷害類型
 */
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'chaos'
/**
 * 傷害事件
 * 在 DamageChain 中傳遞並被修改的數據載體
 */
export interface DamageEvent {
  // === 基礎資訊 ===
  /** 攻擊者 */
  source: ICharacter
  /** 目標 */
  target: ICharacter
  // === 傷害數值 ===
  /** 基礎傷害（攻擊力） */
  baseDamage: number
  /** 最終傷害（經過所有修飾後） */
  finalDamage: number
  // === 傷害類型與標籤 ===
  /** 傷害類型 */
  damageType: DamageType
  /** 傷害標籤（例如 'attack', 'melee', 'crit', 'spell'） */
  tags: Set<string>
  // === 命中與暴擊 ===
  /** 是否暴擊 */
  isCrit: boolean
  /** 是否命中（閃避判定） */
  isHit: boolean
  // === 防禦計算 ===
  /** 護甲減免百分比 (0-1) */
  armorReduction: number
  /** 是否被閃避 */
  evaded: boolean
  // === 元數據 ===
  /** 發生在哪個 Tick */
  tick: number
  /** 是否被完全阻止（例如免疫） */
  prevented: boolean
}
