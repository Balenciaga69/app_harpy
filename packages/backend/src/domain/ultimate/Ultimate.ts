import { BaseInstanceFields, WithCreatedInfo, WithSourceUnit } from '../../shared/models/BaseInstanceFields'
import { GameHook } from '../../shared/models/GameHook'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { AffixAggregate, AffixRecord } from '../affix/Affix'
import { UltimateEffect } from './UltimateEffect'
/** 大絕招樣板，定義大絕招的靜態屬性與行為 */
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
/** 大絕招效果綁定資訊，將效果與其對應的鉤子綁定在一起 */
export interface UltimateRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {
  readonly pluginAffixRecord: ReadonlyArray<AffixRecord>
}
/** 大絕招聚合根，封裝大絕招的狀態與行為 */
export class UltimateAggregate {
  constructor(
    public readonly record: UltimateRecord,
    public readonly template: UltimateTemplate,
    public readonly pluginAffixes: ReadonlyArray<AffixAggregate> = []
  ) {}

  /**
   * 新增插件詞綴，返回新的大絕招聚合實例
   */
  addPluginAffix(affix: AffixAggregate): UltimateAggregate {
    const newPluginAffixes = [...this.pluginAffixes, affix]
    const pluginAffixRecord = newPluginAffixes.map((a) => a.record)
    const newRecord: UltimateRecord = {
      ...this.record,
      pluginAffixRecord,
    }
    return new UltimateAggregate(newRecord, this.template, newPluginAffixes)
  }
}
