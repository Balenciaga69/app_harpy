import { AffixAggregate } from '../../../../domain/affix/Affix'
import { UltimateAggregate, UltimateRecord } from '../../../../domain/ultimate/Ultimate'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { IAffixAggregateService } from '../affix/AffixAggregateService'

export interface IUltimateAggregateService {
  create(record: UltimateRecord): UltimateAggregate
  createMany(records: UltimateRecord[]): UltimateAggregate[]
}

export class UltimateAggregateService implements IUltimateAggregateService {
  constructor(
    private affixAggregateService: IAffixAggregateService,
    private appContextService: IAppContextService
  ) {}
  /** 建立單一 UltimateAggregate */
  public create(record: UltimateRecord) {
    const template = this.resolveTemplate(record.templateId)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateAggregate(record.id, record, template, pluginAffixes)
  }
  /** 批次建立 UltimateAggregate */
  public createMany(records: UltimateRecord[]) {
    return records.map((record) => this.create(record))
  }
  /** 取得大絕招樣板 */
  private resolveTemplate(templateId: string) {
    const store = this.appContextService.GetConfig().ultimateStore
    const template = store.getUltimate(templateId)
    if (!template) {
      throw new Error(`Ultimate樣板不存在: ${templateId}`)
    }
    return template
  }
  /** 取得 pluginAffixes */
  private resolvePluginAffixes(record: UltimateRecord): AffixAggregate[] {
    const affixRecords = [...record.pluginAffixRecord]
    return this.affixAggregateService.createMany(affixRecords)
  }
}
