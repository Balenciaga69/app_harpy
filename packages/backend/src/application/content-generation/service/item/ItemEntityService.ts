import { RelicEntity, RelicRecord, RelicTemplate } from '../../../../domain/item/Item'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { IAffixEntityService } from '../affix/AffixEntityService'
/** 遺物相關的聚合功能服務 */
export interface IItemEntityService {
  /** 從多個 RelicRecord 建立遺物實體 */
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicEntity>
  /** 從 RelicRecord 建立單一遺物實體 */
  createRelicByRecord(record: RelicRecord): RelicEntity
  /** 從模板與當前上下文建立 RelicEntity( 自動產生記錄與詞綴 ) */
  createRelicByTemplateUsingCurrentContext(templateId: string): RelicEntity
  /** 批次從模板與當前上下文建立遺物實體 */
  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicEntity[]
}
export class ItemEntityService implements IItemEntityService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private affixEntityService: IAffixEntityService
  ) {}
  /** 從 RelicRecord 建立 RelicEntity */
  createRelicByRecord(record: RelicRecord): RelicEntity {
    const relicTemplate = this.resolveTemplate(record.templateId)
    const affixEntities = this.affixEntityService.createManyByRecords([...record.affixRecords])
    const relicEntity = new RelicEntity(record, relicTemplate, affixEntities)
    return relicEntity
  }
  /** 從多個 RelicRecord 建立 RelicEntity */
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicEntity> {
    return records.map((record) => this.createRelicByRecord(record))
  }
  /**
   * Creates a new `RelicEntity` instance based on the specified relic template and the current context.
   *
   * This method performs the following steps:
   * 1. Resolves the relic template using the provided `templateId`.
   * 2. Retrieves the current context information required for record creation.
   * 3. Creates affix entities based on the template's affix IDs and the current context.
   * 4. Constructs a new relic record using the template ID, generated affix records, and current context info.
   * 5. Returns a new `RelicEntity` composed of the created record, template, and affix entities.
   */
  createRelicByTemplateUsingCurrentContext(templateId: string) {
    const relicTemplate = this.resolveTemplate(templateId)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const affixEntities = this.affixEntityService.createManyByTemplateUsingCurrentContext([...relicTemplate.affixIds])
    const record = RelicRecordFactory.createOne(templateId, {
      affixRecords: affixEntities.map((a) => a.record),
      ...currentInfo,
    })
    return new RelicEntity(record, relicTemplate, affixEntities)
  }
  /** 從多個遺物模板與當前上下文建立 RelicEntity */
  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicEntity[] {
    return templateIds.map((templateId) => this.createRelicByTemplateUsingCurrentContext(templateId))
  }
  /** 透過 templateId 取得 RelicTemplate */
  private resolveTemplate(templateId: string): RelicTemplate {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(templateId)
    return template
  }
}
