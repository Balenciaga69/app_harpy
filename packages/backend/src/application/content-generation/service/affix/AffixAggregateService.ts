// ...existing code...
import { AffixAggregate, AffixRecord, AffixTemplate } from '../../../../domain/affix/Affix'
import { AffixEffect } from '../../../../domain/affix/effect/AffixEffectTemplate'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { AffixRecordFactory } from '../../factory/AffixFactory'
/**
 * 詞綴聚合根服務：負責建立 AffixAggregate
 * 職責：透過模板與當前上下文組裝完整的詞綴聚合根
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IAffixAggregateService {
  /** 從 AffixRecord 建立單一詞綴聚合根( 組裝現有記錄 ) */
  createOneByRecord(record: AffixRecord): AffixAggregate
  /** 批次從 AffixRecord 建立詞綴聚合根 */
  createManyByRecords(records: AffixRecord[]): AffixAggregate[]
  /** 從模板與當前上下文建立單一詞綴聚合根( 自動產生記錄 ) */
  createOneByTemplateUsingCurrentContext(templateId: string): AffixAggregate
  /** 批次從模板與當前上下文建立詞綴聚合根 */
  createManyByTemplateUsingCurrentContext(templateIds: string[]): AffixAggregate[]
}
export class AffixAggregateService implements IAffixAggregateService {
  constructor(
    private readonly configStoreAccessor: IConfigStoreAccessor,
    private readonly contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 建立單一 AffixAggregate */
  createOneByRecord(record: AffixRecord): AffixAggregate {
    const template = this.resolveTemplate(record.templateId)
    const effects = this.resolveEffects(template)
    return new AffixAggregate(record, template, effects)
  }
  /** 批次建立 AffixAggregate */
  createManyByRecords(records: AffixRecord[]): AffixAggregate[] {
    return records.map((r) => this.createOneByRecord(r))
  }
  /** 從當前上下文建立單一 AffixAggregate */
  createOneByTemplateUsingCurrentContext(templateId: string): AffixAggregate {
    const template = this.resolveTemplate(templateId)
    const effects = this.resolveEffects(template)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const record = AffixRecordFactory.createOne(templateId, currentInfo)
    return new AffixAggregate(record, template, effects)
  }
  /** 從當前上下文批次建立 AffixAggregate */
  createManyByTemplateUsingCurrentContext(templateIds: string[]): AffixAggregate[] {
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const records = AffixRecordFactory.createMany(templateIds, currentInfo)
    return records.map((record) => {
      const template = this.resolveTemplate(record.templateId)
      const effects = this.resolveEffects(template)
      return new AffixAggregate(record, template, effects)
    })
  }
  /** 透過 templateId 取得 AffixTemplate */
  private resolveTemplate(templateId: string) {
    const { affixStore } = this.configStoreAccessor.getConfigStore()
    const template = affixStore.getAffix(templateId)
    if (!template) {
      throw new Error(`樣板不存在: ${templateId}`)
    }
    return template
  }
  /** 從 template 取得 effects */
  private resolveEffects(template: AffixTemplate): AffixEffect[] {
    const { affixStore } = this.configStoreAccessor.getConfigStore()
    return template.effectIds.map((effectId) => {
      const effects = affixStore.getAffixEffect(effectId)
      if (!effects) {
        throw new Error(`效果不存在: ${effectId}`)
      }
      return effects
    })
  }
}
