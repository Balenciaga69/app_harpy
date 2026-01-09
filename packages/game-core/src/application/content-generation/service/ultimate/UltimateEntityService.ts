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
  createOneByRecord(record: UltimateRecord): UltimateEntity

  createManyByRecords(records: UltimateRecord[]): UltimateEntity[]

  createOneByTemplateUsingCurrentContext(templateId: string): UltimateEntity

  createManyByTemplateUsingCurrentContext(templateIds: string[]): UltimateEntity[]
}
export class UltimateEntityService implements IUltimateEntityService {
  constructor(
    private affixEntityService: IAffixEntityService,
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}

  public createOneByRecord(record: UltimateRecord) {
    const template = this.resolveTemplate(record.templateId)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateEntity(record, template, pluginAffixes)
  }

  public createManyByRecords(records: UltimateRecord[]) {
    return records.map((record) => this.createOneByRecord(record))
  }

  public createOneByTemplateUsingCurrentContext(templateId: string) {
    const template = this.resolveTemplate(templateId)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const record = UltimateRecordFactory.createOne(template.id, currentInfo)
    const pluginAffixes = this.resolvePluginAffixes(record)
    return new UltimateEntity(record, template, pluginAffixes)
  }

  public createManyByTemplateUsingCurrentContext(templateIds: string[]) {
    return templateIds.map((templateId) => this.createOneByTemplateUsingCurrentContext(templateId))
  }

  private resolveTemplate(templateId: string): UltimateTemplate {
    const { ultimateStore } = this.configStoreAccessor.getConfigStore()
    const template = ultimateStore.getUltimate(templateId)
    return template
  }

  private resolvePluginAffixes(record: UltimateRecord): AffixEntity[] {
    const affixRecords = [...record.pluginAffixRecord]
    return this.affixEntityService.createManyByRecords(affixRecords)
  }
}
