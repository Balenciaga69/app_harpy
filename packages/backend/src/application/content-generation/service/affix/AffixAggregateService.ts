// ...existing code...
import { AffixAggregate, AffixRecord, AffixTemplate } from '../../../../domain/affix/Affix'
import { AffixEffect } from '../../../../domain/affix/effect/AffixEffectTemplate'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { AffixRecordFactory } from '../../factory/AffixFactory'
export interface IAffixAggregateService {
  createOneByRecord(record: AffixRecord): AffixAggregate
  createManyByRecord(records: AffixRecord[]): AffixAggregate[]
  createOneByTemplateUsingCurrentContext(templateId: string): AffixAggregate
  createManyByTemplateUsingCurrentContext(templateIds: string[]): AffixAggregate[]
}
// 提供建立 AffixAggregate 的服務
export class AffixAggregateService implements IAffixAggregateService {
  constructor(private readonly appContextService: IAppContextService) {}
  // 建立單一 AffixAggregate
  createOneByRecord(record: AffixRecord): AffixAggregate {
    const template = this.resolveTemplate(record.templateId)
    const effects = this.resolveEffects(template)
    return new AffixAggregate(record, template, effects)
  }
  // 批次建立 AffixAggregate
  createManyByRecord(records: AffixRecord[]): AffixAggregate[] {
    return records.map((r) => this.createOneByRecord(r))
  }

  // 從當前上下文建立單一 AffixAggregate
  createOneByTemplateUsingCurrentContext(templateId: string): AffixAggregate {
    const template = this.resolveTemplate(templateId)
    const effects = this.resolveEffects(template)
    const currentInfo = this.appContextService.getCurrentInfoForCreateRecord()
    const record = AffixRecordFactory.createOne(templateId, currentInfo)
    return new AffixAggregate(record, template, effects)
  }
  // 從當前上下文批次建立 AffixAggregate
  createManyByTemplateUsingCurrentContext(templateIds: string[]): AffixAggregate[] {
    const currentInfo = this.appContextService.getCurrentInfoForCreateRecord()
    const records = AffixRecordFactory.createMany(templateIds, currentInfo)
    return records.map((record) => {
      const template = this.resolveTemplate(record.templateId)
      const effects = this.resolveEffects(template)
      return new AffixAggregate(record, template, effects)
    })
  }
  // 透過 templateId 取得 AffixTemplate
  private resolveTemplate(templateId: string) {
    const store = this.appContextService.GetConfig().affixStore
    const template = store.getAffix(templateId)
    if (!template) {
      throw new Error(`樣板不存在: ${templateId}`)
    }
    return template
  }
  // 從  template 取得 effects
  private resolveEffects(template: AffixTemplate): AffixEffect[] {
    const store = this.appContextService.GetConfig().affixStore
    return template.effectIds.map((effectId) => {
      const effects = store.getAffixEffect(effectId)
      if (!effects) {
        throw new Error(`效果不存在: ${effectId}`)
      }
      return effects
    })
  }
}
