import { nanoid } from 'nanoid'
import { UltimateRecord, UltimateTemplate, UltimateAggregate } from '../../../domain/ultimate/Ultimate'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { AffixAggregate } from '../../../domain/affix/Affix'

/** UltimateRecord 創建參數 */
export interface UltimateRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}

/**
 * UltimateRecordFactory：負責大絕招記錄的創建
 * - 單一職責：生成帶有唯一 ID 與創建背景的大絕招記錄
 * - 無副作用：純粹的資料構建
 */
export class UltimateRecordFactory {
  /**
   * 創建單一大絕招記錄
   */
  createRecord(templateId: string, params: UltimateRecordCreateParams): UltimateRecord {
    return {
      id: 'ultimate-record-' + nanoid(),
      templateId,
      sourceUnitId: params.sourceUnitId,
      pluginAffixRecord: [],
      atCreated: params.atCreated,
    }
  }

  /**
   * 批量創建大絕招記錄
   */
  createManyRecords(templateIds: string[], params: UltimateRecordCreateParams): UltimateRecord[] {
    return templateIds.map((templateId) => this.createRecord(templateId, params))
  }
}

/**
 * UltimateAggregateAssembler：負責大絕招聚合根的組裝
 * - 單一職責：將 record、template、pluginAffixes 組合成聚合根
 * - 邊界：假設所有輸入皆有效（驗證職責在上層）
 */
export class UltimateAggregateAssembler {
  /**
   * 組裝單一大絕招聚合根
   */
  assemble(params: {
    record: UltimateRecord
    template: UltimateTemplate
    pluginAffixes?: ReadonlyArray<AffixAggregate>
  }): UltimateAggregate {
    return new UltimateAggregate(params.record.id, params.record, params.template, params.pluginAffixes)
  }

  /**
   * 批量組裝大絕招聚合根
   */
  assembleMany(params: {
    records: UltimateRecord[]
    templates: UltimateTemplate[]
    pluginAffixes?: Map<string, AffixAggregate[]>
  }): UltimateAggregate[] {
    const templateMap = new Map(params.templates.map((t) => [t.id, t]))

    return params.records.map((record) => {
      const template = templateMap.get(record.templateId)
      const affixes = params.pluginAffixes?.get(record.id) ?? []

      if (!template) {
        throw new Error(`大絕招樣板不存在: ${record.templateId}`)
      }

      return this.assemble({
        record,
        template,
        pluginAffixes: affixes,
      })
    })
  }
}
