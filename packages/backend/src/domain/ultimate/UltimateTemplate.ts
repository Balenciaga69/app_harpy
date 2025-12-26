import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UltimateEffect } from './UltimateEffect'
/** 大絕招的引擎鉤子事件，決定大絕招在何時執行效果 */
// TODO: AffixEffectTrigger 也有類似東西，應該統一配置為戰鬥內外的 HOOK
export type UltimateHookEvent =
  | 'ON_CAST' // 當大絕招施放時 (通常在攻擊階段取代普通攻擊)
  | 'ON_DRAW' // 當抽到牌時觸發 (可由引擎在抽牌流程中呼叫)
  | 'ON_REDRAW' // 重新抽牌/重抽時的事件
  | 'ON_START' // 戰鬥或回合開始
  | 'ON_END' // 戰鬥或回合結束
/** 大絕招樣板，定義大絕招的靜態屬性、消耗與觸發效果 */
export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly energyCost: number
  // TODO: 內容須釐清是否該繼續補充
  // 向後相容：允許頂層效果 (可選)
  readonly effect?: UltimateEffect[]
  // 推薦方式：使用更細粒度的鉤子與效果配對
  readonly hooks?: { event: UltimateHookEvent; effects: UltimateEffect[] }[]
  // 額外元資料，提供給引擎或外部狀態使用 (例如外部計數器鍵、紀錄鍵等)
  readonly metadata?: Record<string, unknown>
}
