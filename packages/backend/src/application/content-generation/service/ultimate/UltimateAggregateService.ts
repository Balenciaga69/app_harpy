import { AffixAggregate } from '../../../../domain/affix/Affix'
import { UltimateAggregate, UltimateRecord } from '../../../../domain/ultimate/Ultimate'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { UltimateRecordFactory } from '../../factory/UltimateFactory'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
export interface IUltimateAggregateService {
  createOneByRecord(record: UltimateRecord): UltimateAggregate
  createManyByRecord(records: UltimateRecord[]): UltimateAggregate[]
  createOneByTemplateUsingCurrentContext(templateId: string): UltimateAggregate
  createManyByTemplateUsingCurrentContext(templateIds: string[]): UltimateAggregate[]
}
export class UltimateAggregateService implements IUltimateAggregateService {
  constructor(
    private affixAggregateService: IAffixAggregateService,
    private appContextService: IAppContextService
  ) {}
  /** 建立單一 UltimateAggregate */
  public createOneByRecord(record: UltimateRecord) {
    const template = this.resolveTemplate(record.templateId)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateAggregate(record, template, pluginAffixes)
  }
  /** 批次建立 UltimateAggregate */
  public createManyByRecord(records: UltimateRecord[]) {
    return records.map((record) => this.createOneByRecord(record))
  }

  /** 從 templateId 與當前上下文建立一個 UltimateAggregate（自動產生 UltimateRecord） */
  public createOneByTemplateUsingCurrentContext(templateId: string) {
    const template = this.resolveTemplate(templateId)
    const currentInfo = this.appContextService.getCurrentInfoForCreateRecord()
    const record = UltimateRecordFactory.createOne(template.id, currentInfo)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateAggregate(record, template, pluginAffixes)
  }

  /** 從多個 templateIds 與當前上下文批次建立 UltimateAggregate */
  public createManyByTemplateUsingCurrentContext(templateIds: string[]) {
    return templateIds.map((templateId) => this.createOneByTemplateUsingCurrentContext(templateId))
  }
  // 取得 UltimateTemplate
  private resolveTemplate(templateId: string) {
    const store = this.appContextService.getConfigStore().ultimateStore
    const template = store.getUltimate(templateId)
    if (!template) {
      throw new Error(`Ultimate樣板不存在: ${templateId}`)
    }
    return template
  }
  /** 取得 pluginAffixes */
  private resolvePluginAffixes(record: UltimateRecord): AffixAggregate[] {
    const affixRecords = [...record.pluginAffixRecord]
    return this.affixAggregateService.createManyByRecord(affixRecords)
  }
}
