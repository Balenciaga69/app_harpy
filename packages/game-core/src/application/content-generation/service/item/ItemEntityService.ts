import { RelicEntity, RelicRecord, RelicTemplate } from '../../../../domain/item/Item'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { IAffixEntityService } from '../affix/AffixEntityService'

export interface IItemEntityService {
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicEntity>

  createRelicByRecord(record: RelicRecord): RelicEntity

  createRelicByTemplateUsingCurrentContext(templateId: string): RelicEntity

  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicEntity[]
}
export class ItemEntityService implements IItemEntityService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private affixEntityService: IAffixEntityService
  ) {}

  createRelicByRecord(record: RelicRecord): RelicEntity {
    const relicTemplate = this.resolveTemplate(record.templateId)
    const affixEntities = this.affixEntityService.createManyByRecords([...record.affixRecords])
    const relicEntity = new RelicEntity(record, relicTemplate, affixEntities)
    return relicEntity
  }

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

  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicEntity[] {
    return templateIds.map((templateId) => this.createRelicByTemplateUsingCurrentContext(templateId))
  }

  private resolveTemplate(templateId: string): RelicTemplate {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(templateId)
    return template
  }
}
