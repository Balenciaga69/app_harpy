// TODO: [跨層依賴] Logic 層依賴 Domain 層的 ICharacter 介面
// 原因：DamageEvent 需要在傷害鏈中訪問角色的屬性和狀態
// 遷移注意：若遷移到強類型語言（如 C#/Go），需考慮：
//   1. 將 ICharacter 提升為共用契約層
//   2. 或讓 DamageEvent 只持有 CharacterId，透過 Context 查詢角色
import type { ICharacter } from '@/modules/combat/domain/character'
/**
 * 傷害事件 - 流程數據模型
 *
 * 這不是純資料模型，而是在 DamageChain 流程中傳遞的載體
 * 包含對實體的引用，因此依賴 Domain 層
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
