import { AffixEntity } from '../../../../domain/affix/Affix'
import { UltimateEntity, UltimateRecord, UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { UltimateRecordFactory } from '../../factory/UltimateFactory'
import { IAffixEntityService } from '../affix/AffixEntityService'
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
