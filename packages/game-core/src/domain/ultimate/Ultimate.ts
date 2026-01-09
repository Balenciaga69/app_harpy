import { BaseInstanceFields, WithCreatedInfo, WithSourceUnit } from '../../shared/models/BaseInstanceFields'
import { GameHook } from '../../shared/models/GameHook'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { AffixEntity, AffixRecord } from '../affix/Affix'
import { UltimateEffect } from './UltimateEffect'

export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly energyCost: number

  readonly hooks?: { event: GameHook; effects: UltimateEffect[] }[]

  readonly metadata?: Record<string, unknown>
}

export interface UltimateRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {
  readonly pluginAffixRecord: ReadonlyArray<AffixRecord>
}

export class UltimateEntity {
  constructor(
    public readonly record: UltimateRecord,
    public readonly template: UltimateTemplate,
    public readonly pluginAffixes: ReadonlyArray<AffixEntity> = []
  ) {}
  /**
   * 新增插件詞綴，返回新的大絕招實體
   */
  addPluginAffix(affix: AffixEntity): UltimateEntity {
    const newPluginAffixes = [...this.pluginAffixes, affix]
    const pluginAffixRecord = newPluginAffixes.map((a) => a.record)
    const newRecord: UltimateRecord = {
      ...this.record,
      pluginAffixRecord,
    }
    return new UltimateEntity(newRecord, this.template, newPluginAffixes)
  }
}
