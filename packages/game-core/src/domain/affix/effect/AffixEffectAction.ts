import { EffectTarget } from '../../../shared/models/EffectTarget'
import { AilmentId } from '../../ailment/AilmentId'
import { UnitStatModifierOperation } from '../../stats/models/StatModifier'
import { UnitStats } from '../../stats/models/UnitStats'
/** 詞綴效果行動類型 */
export type AffixEffectActionType = 'STAT_MODIFY' | 'APPLY_STATUS'
/** 詞綴效果的基礎配置，定義效果的觸發倍率 */
interface BaseAffixEffectAction {
  readonly type: AffixEffectActionType
  readonly affixMultiplier?: number
}
/** 統計值修改效果，對目標單位的特定統計屬性應用操作 */
export interface StatModifyAction extends BaseAffixEffectAction {
  readonly type: 'STAT_MODIFY'
  readonly stat: keyof UnitStats
  readonly operation: UnitStatModifierOperation
  readonly value: number
}
/** 異常狀態應用效果，對目標單位施加指定異常狀態與堆疊層數 */
export interface ApplyStatusAction extends BaseAffixEffectAction {
  readonly type: 'APPLY_STATUS'
  readonly ailmentId: AilmentId
  readonly target: EffectTarget
  readonly stacks: number
}
/** 詞綴效果的聯合型別，可為統計修改或異常狀態應用 */
export type AffixEffectAction = StatModifyAction | ApplyStatusAction
