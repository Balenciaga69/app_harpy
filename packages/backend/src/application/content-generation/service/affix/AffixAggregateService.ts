// ...existing code...
import { AffixAggregate, AffixRecord, AffixTemplate } from '../../../../domain/affix/Affix'
import { AffixEffect } from '../../../../domain/affix/effect/AffixEffectTemplate'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
export interface IAffixAggregateService {
  create(record: AffixRecord): AffixAggregate
  createMany(records: AffixRecord[]): AffixAggregate[]
}
// 提供建立 AffixAggregate 的服務
export class AffixAggregateService implements IAffixAggregateService {
  constructor(private readonly appContextService: IAppContextService) {}
  // 建立單一 AffixAggregate
  create(record: AffixRecord): AffixAggregate {
    const template = this.resolveTemplate(record.templateId)
    const effects = this.resolveEffects(template)
    return new AffixAggregate(record, template, effects)
  }
  // 批次建立 AffixAggregate
  createMany(records: AffixRecord[]): AffixAggregate[] {
    return records.map((r) => this.create(r))
  }
  // 透過 templateId 取得 AffixTemplate
  private resolveTemplate(templateId: string) {
    const store = this.appContextService.GetConfig().affixStore
    const template = store.getAffix(templateId)
    if (!template) {
      throw new Error(`Affix樣板不存在: ${templateId}`)
    }
    return template
  }
  // 從  template 取得 effects
  private resolveEffects(template: AffixTemplate): AffixEffect[] {
    const store = this.appContextService.GetConfig().affixStore
    return template.effectIds.map((effectId) => {
      const effects = store.getAffixEffect(effectId)
      if (!effects) {
        throw new Error(`Affix效果不存在: ${effectId}`)
      }
      return effects
    })
  }
}
