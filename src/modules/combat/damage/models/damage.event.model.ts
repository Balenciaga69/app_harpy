import type { ICharacter } from '../../character'
/**
 * 傷害事件
 * 在 DamageChain 中傳遞並被修改的數據載體
 *
 * 設計原則：
 * - 統一使用純粹傷害 (amount)
 * - 支援真實傷害 (isTrueDamage)
 * - 支援大招標記 (isUltimate)
 */
export interface DamageEvent {
  // === 基礎資訊 ===
  /** 攻擊者 */
  source: ICharacter
  /** 目標 */
  target: ICharacter
  // === 傷害數值 ===
  /** 基礎傷害值 */
  amount: number
  /** 最終總傷害 */
  finalDamage: number
  // === 標記 ===
  /** 是否為大招 */
  isUltimate: boolean
  /** 是否為真實傷害 (無視防禦) */
  isTrueDamage: boolean
  // === 命中與暴擊 ===
  /** 是否暴擊 */
  isCrit: boolean
  /** 是否命中（false = 被閃避） */
  isHit: boolean
  // === 元數據 ===
  /** 發生在哪個 Tick */
  tick: number
  /** 是否被完全阻止（例如免疫） */
  prevented: boolean
}
