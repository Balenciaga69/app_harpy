import { AffixAggregate } from '../../../../domain/affix/Affix'
import { UltimateAggregate, UltimateRecord, UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { UltimateRecordFactory } from '../../factory/UltimateFactory'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
/**
 * 大絕招聚合根服務：負責建立 UltimateAggregate
 * 職責：透過模板、詞綴聚合根與當前上下文組裝完整的大絕招聚合根
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )、IAffixAggregateService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IUltimateAggregateService {
  /** 從 UltimateRecord 建立單一大絕招聚合根( 組裝現有記錄 ) */
  createOneByRecord(record: UltimateRecord): UltimateAggregate
  /** 批次從 UltimateRecord 建立大絕招聚合根 */
  createManyByRecords(records: UltimateRecord[]): UltimateAggregate[]
  /** 從模板與當前上下文建立單一大絕招聚合根( 自動產生記錄 ) */
  createOneByTemplateUsingCurrentContext(templateId: string): UltimateAggregate
  /** 批次從模板與當前上下文建立大絕招聚合根 */
  createManyByTemplateUsingCurrentContext(templateIds: string[]): UltimateAggregate[]
}
export class UltimateAggregateService implements IUltimateAggregateService {
  constructor(
    private affixAggregateService: IAffixAggregateService,
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 建立單一 UltimateAggregate */
  public createOneByRecord(record: UltimateRecord) {
    const template = this.resolveTemplate(record.templateId)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateAggregate(record, template, pluginAffixes)
  }
  /** 批次建立 UltimateAggregate */
  public createManyByRecords(records: UltimateRecord[]) {
    return records.map((record) => this.createOneByRecord(record))
  }
  /** 從 templateId 與當前上下文建立一個 UltimateAggregate( 自動產生 UltimateRecord ) */
  public createOneByTemplateUsingCurrentContext(templateId: string) {
    const template = this.resolveTemplate(templateId)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const record = UltimateRecordFactory.createOne(template.id, currentInfo)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateAggregate(record, template, pluginAffixes)
  }
  /** 從多個 templateIds 與當前上下文批次建立 UltimateAggregate */
  public createManyByTemplateUsingCurrentContext(templateIds: string[]) {
    return templateIds.map((templateId) => this.createOneByTemplateUsingCurrentContext(templateId))
  }
  /** 取得 UltimateTemplate */
  private resolveTemplate(templateId: string): UltimateTemplate {
    const { ultimateStore } = this.configStoreAccessor.getConfigStore()
    const template = ultimateStore.getUltimate(templateId)
    return template
  }
  /** 取得 pluginAffixes */
  private resolvePluginAffixes(record: UltimateRecord): AffixAggregate[] {
    const affixRecords = [...record.pluginAffixRecord]
    return this.affixAggregateService.createManyByRecords(affixRecords)
  }
}
