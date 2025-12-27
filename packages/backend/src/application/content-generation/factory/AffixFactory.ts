import { nanoid } from 'nanoid'
import { AffixAggregate, AffixRecord, AffixTemplate } from '../../../domain/affix/Affix'
import { AtCreatedInfo } from '../../../shared/models/BaseInstanceFields'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'

/** AffixRecord 創建參數 */
export interface AffixRecordCreateParams {
  difficulty: number
  sourceUnitId: string
  atCreated: AtCreatedInfo
}

/**
 * AffixRecordFactory：負責詞綴記錄的創建
 * - 單一職責：生成帶有唯一 ID 與創建背景的詞綴記錄
 * - 無副作用：純粹的資料構建
 */
export class AffixRecordFactory {
  /**
   * 創建單一詞綴記錄
   */
  createRecord(templateId: string, params: AffixRecordCreateParams): AffixRecord {
    return {
      id: 'affix-record-' + nanoid(),
      templateId,
      sourceUnitId: params.sourceUnitId,
      atCreated: params.atCreated,
    }
  }

  /**
   * 批量創建詞綴記錄
   */
  createManyRecords(templateIds: string[], params: AffixRecordCreateParams): AffixRecord[] {
    return templateIds.map((templateId) => this.createRecord(templateId, params))
  }
}

/**
 * AffixAggregateAssembler：負責詞綴聚合根的組裝
 * - 單一職責：將 record、template、effects 組合成聚合根
 * - 邊界：假設所有輸入皆有效（驗證職責在上層）
 */
export class AffixAggregateAssembler {
  /**
   * 組裝單一詞綴聚合根
   */
  assemble(params: {
    record: AffixRecord
    template: AffixTemplate
    effects: ReadonlyArray<AffixEffect>
  }): AffixAggregate {
    return new AffixAggregate(params.record, params.template, params.effects)
  }

  /**
   * 批量組裝詞綴聚合根
   */
  assembleMany(params: {
    records: AffixRecord[]
    templates: AffixTemplate[]
    effects: AffixEffect[]
  }): AffixAggregate[] {
    const templateMap = new Map(params.templates.map((t) => [t.id, t]))

    return params.records.map((record) => {
      const template = templateMap.get(record.templateId)
      const recordEffects = params.effects.filter((e) => template?.effectIds.includes(e.id))

      if (!template) {
        throw new Error(`詞綴樣板不存在: ${record.templateId}`)
      }

      return this.assemble({
        record,
        template,
        effects: recordEffects,
      })
    })
  }
}
