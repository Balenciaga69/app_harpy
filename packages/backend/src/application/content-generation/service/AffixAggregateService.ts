// ...existing code...
import { AffixAggregate, AffixRecord, AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'

export interface IAffixAggregateService {
  create(record: AffixRecord): AffixAggregate
  createMany(records: AffixRecord[]): AffixAggregate[]
}

/**
 * AffixAggregate 建構服務
 * - 負責從 app context 的 affixStore 解析樣板與效果，並建立 Aggregates
 * - 依賴: IAppContextService（透過 constructor 注入）
 * - 無副作用（僅讀取 store）
 */
export class AffixAggregateService implements IAffixAggregateService {
  constructor(private readonly appContextService: IAppContextService) {}

  /**
   * 建立單一 AffixAggregate
   * - 會驗證樣板與效果存在，否則拋錯
   */
  create(record: AffixRecord): AffixAggregate {
    const template = this.resolveTemplate(record.templateId)
    const effects = this.resolveEffects(template)
    return new AffixAggregate(record, template, effects)
  }

  /**
   * 批次建立 AffixAggregate
   */
  createMany(records: AffixRecord[]): AffixAggregate[] {
    return records.map((r) => this.create(r))
  }

  /** 依 templateId 解析樣板，找不到會拋錯 */
  private resolveTemplate(templateId: string) {
    const store = this.appContextService.GetConfig().affixStore
    const template = store.getAffix(templateId)
    if (!template) {
      throw new Error(`Affix樣板不存在: ${templateId}`)
    }
    return template
  }

  /** 根據樣板解析所有 effect，任何找不到的 effect 會拋錯 */
  private resolveEffects(template: AffixTemplate): AffixEffect[] {
    const store = this.appContextService.GetConfig().affixStore
    return template.effectIds.map((effectId) => {
      const effect = store.getAffixEffect(effectId)
      if (!effect) {
        throw new Error(`Affix效果不存在: ${effectId}`)
      }
      return effect
    })
  }
}
