import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UltimateEffect } from './UltimateEffect'
import { GameHook } from '../../shared/models/GameHook'
export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly energyCost: number
  // 推薦方式：使用更細粒度的鉤子與效果配對
  readonly hooks?: { event: GameHook; effects: UltimateEffect[] }[]
  // 額外元資料，提供給引擎或外部狀態使用 (例如外部計數器鍵、紀錄鍵等)
  readonly metadata?: Record<string, unknown>
}
