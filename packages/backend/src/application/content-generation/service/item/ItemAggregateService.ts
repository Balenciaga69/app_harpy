import { RelicEntity, RelicRecord, RelicTemplate } from '../../../../domain/item/Item'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
/** 遺物相關的聚合功能服務 */
export interface IItemAggregateService {
  /** 從多個 RelicRecord 建立遺物實體 */
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicEntity>
  /** 從 RelicRecord 建立單一遺物實體 */
  createRelicByRecord(record: RelicRecord): RelicEntity
  /** 從模板與當前上下文建立 RelicEntity( 自動產生記錄與詞綴 ) */
  createRelicByTemplateUsingCurrentContext(templateId: string): RelicEntity
  /** 批次從模板與當前上下文建立遺物實體 */
  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicEntity[]
}
export class ItemAggregateService implements IItemAggregateService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private affixAggregateService: IAffixAggregateService
  ) {}
  /** 從 RelicRecord 建立 RelicEntity */
  createRelicByRecord(record: RelicRecord): RelicEntity {
    const relicTemplate = this.resolveTemplate(record.templateId)
    const affixAggregates = this.affixAggregateService.createManyByRecords([...record.affixRecords])
    const relicAggregate = new RelicEntity(record, relicTemplate, affixAggregates)
    return relicAggregate
  }
  /** 從多個 RelicRecord 建立 RelicEntity */
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicEntity> {
    return records.map((record) => this.createRelicByRecord(record))
  }
  /** 從遺物模板與當前上下文建立 RelicEntity */
  createRelicByTemplateUsingCurrentContext(templateId: string) {
    const relicTemplate = this.resolveTemplate(templateId)
    // 取得 currentInfo
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    // 建立 affix aggregates
    const affixAggregates = this.affixAggregateService.createManyByTemplateUsingCurrentContext([
      ...relicTemplate.affixIds,
    ])
    // 建立 relic record
    const record = RelicRecordFactory.createOne(templateId, {
      affixRecords: affixAggregates.map((a) => a.record),
      ...currentInfo,
    })
    return new RelicEntity(record, relicTemplate, affixAggregates)
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
