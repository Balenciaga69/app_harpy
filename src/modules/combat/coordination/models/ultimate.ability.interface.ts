import type { ICharacter } from '../../domain/character'
import type { CombatContext } from '../../context'
/**
 * 大招介面
 *
 * 設計理念：
 * - 大招不一定是傷害技能，可以是輔助、召喚、治療等
 * - 使用策略模式，每個角色可以有不同的大招實現
 * - 大招執行時能量已被清空，可以專注於技能邏輯
 */
export interface IUltimateAbility {
  /** 大招唯一標識 */
  readonly id: string
  /** 大招名稱 */
  readonly name: string
  /** 大招描述 */
  readonly description: string
  /** 大招類型標記（用於 UI 顯示或分類） */
  readonly type: UltimateType
  /**
   * 執行大招
   * @param caster 施放者
   * @param context 戰鬥上下文
   */
  execute(caster: ICharacter, context: CombatContext): void
}
/** 大招類型 */
export type UltimateType =
  | 'damage' // 傷害型
  | 'buff' // 增益型
  | 'heal' // 治療型
  | 'summon' // 召喚型
  | 'control' // 控制型
  | 'hybrid' // 混合型
