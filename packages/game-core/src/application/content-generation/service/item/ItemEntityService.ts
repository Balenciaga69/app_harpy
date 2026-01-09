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
