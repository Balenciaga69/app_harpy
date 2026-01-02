import { AffixEntity } from '../../../../domain/affix/Affix'
import { UltimateEntity, UltimateRecord, UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { UltimateRecordFactory } from '../../factory/UltimateFactory'
import { IAffixEntityService } from '../affix/AffixEntityService'
/**
 * 大絕招實體服務：負責建立 UltimateEntity
 * 職責：透過模板、詞綴實體與當前上下文組裝完整的大絕招實體
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )、IAffixEntityService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IUltimateEntityService {
  /** 從 UltimateRecord 建立單一大絕招實體( 組裝現有記錄 ) */
  createOneByRecord(record: UltimateRecord): UltimateEntity
  /** 批次從 UltimateRecord 建立大絕招實體 */
  createManyByRecords(records: UltimateRecord[]): UltimateEntity[]
  /** 從模板與當前上下文建立單一大絕招實體( 自動產生記錄 ) */
  createOneByTemplateUsingCurrentContext(templateId: string): UltimateEntity
  /** 批次從模板與當前上下文建立大絕招實體 */
  createManyByTemplateUsingCurrentContext(templateIds: string[]): UltimateEntity[]
}
export class UltimateEntityService implements IUltimateEntityService {
  constructor(
    private affixEntityService: IAffixEntityService,
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /** 建立單一 UltimateEntity */
  public createOneByRecord(record: UltimateRecord) {
    const template = this.resolveTemplate(record.templateId)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateEntity(record, template, pluginAffixes)
  }
  /** 批次建立 UltimateEntity */
  public createManyByRecords(records: UltimateRecord[]) {
    return records.map((record) => this.createOneByRecord(record))
  }
  /** 從 templateId 與當前上下文建立一個 UltimateEntity( 自動產生 UltimateRecord ) */
  public createOneByTemplateUsingCurrentContext(templateId: string) {
    const template = this.resolveTemplate(templateId)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const record = UltimateRecordFactory.createOne(template.id, currentInfo)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateEntity(record, template, pluginAffixes)
  }
  /** 從多個 templateIds 與當前上下文批次建立 UltimateEntity */
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
  private resolvePluginAffixes(record: UltimateRecord): AffixEntity[] {
    const affixRecords = [...record.pluginAffixRecord]
    return this.affixEntityService.createManyByRecords(affixRecords)
  }
}
