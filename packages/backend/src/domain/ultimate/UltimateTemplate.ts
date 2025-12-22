import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UltimateEffect } from './UltimateEffect'

// 明確的 hook event 列舉（暫時放在此處，之後可移出成共用檔）
export type UltimateHookEvent =
  | 'ON_CAST' // 當大絕招施放時（通常在攻擊階段取代普通攻擊）
  | 'ON_DRAW' // 當抽到牌時觸發（可由引擎在抽牌流程中呼叫）
  | 'ON_REDRAW' // 重新抽牌/重抽時的事件
  | 'ON_START' // 戰鬥或回合開始
  | 'ON_END' // 戰鬥或回合結束

export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly energyCost: number
  // TODO: 內容須釐清是否該繼續補充
  // backward-compatible: allow top-level effects (optional)
  readonly effect?: UltimateEffect[]
  // 新：使用更細粒度的 hooks（推薦使用）
  readonly hooks?: { event: UltimateHookEvent; effects: UltimateEffect[] }[]
  // 額外 metadata，給引擎或外部狀態使用（例如 external counter key, record key 等）
  readonly metadata?: Record<string, unknown>
}
