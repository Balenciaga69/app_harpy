import { RelicAggregate, RelicRecord, RelicTemplate } from '../../../../domain/item/Item'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
/** 遺物相關的聚合功能服務 */
export interface IItemAggregateService {
  /** 從多個 RelicRecord 建立遺物聚合根 */
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicAggregate>
  /** 從 RelicRecord 建立單一遺物聚合根 */
  createRelicByRecord(record: RelicRecord): RelicAggregate
  /** 從模板與當前上下文建立 RelicAggregate( 自動產生記錄與詞綴 ) */
  createRelicByTemplateUsingCurrentContext(templateId: string): RelicAggregate
  /** 批次從模板與當前上下文建立遺物聚合根 */
  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicAggregate[]
}
export class ItemAggregateService implements IItemAggregateService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private affixAggregateService: IAffixAggregateService
  ) {}
  /** 從 RelicRecord 建立 RelicAggregate */
  createRelicByRecord(record: RelicRecord): RelicAggregate {
    const relicTemplate = this.resolveTemplate(record.templateId)
    const affixAggregates = this.affixAggregateService.createManyByRecords([...record.affixRecords])
    const relicAggregate = new RelicAggregate(record, relicTemplate, affixAggregates)
    return relicAggregate
  }
  /** 從多個 RelicRecord 建立 RelicAggregate */
  createRelicsByRecords(records: ReadonlyArray<RelicRecord>): ReadonlyArray<RelicAggregate> {
    return records.map((record) => this.createRelicByRecord(record))
  }
  /** 從遺物模板與當前上下文建立 RelicAggregate */
  createRelicByTemplateUsingCurrentContext(templateId: string) {
    const relicTemplate = this.resolveTemplate(templateId)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const affixAggregates = this.affixAggregateService.createManyByTemplateUsingCurrentContext([
      ...relicTemplate.affixIds,
    ])
    const record = RelicRecordFactory.createOne(templateId, {
      affixRecords: affixAggregates.map((a) => a.record),
      ...currentInfo,
    })
    return new RelicAggregate(record, relicTemplate, affixAggregates)
  }
  /** 從多個遺物模板與當前上下文建立 RelicAggregate */
  createRelicsByTemplateUsingCurrentContext(templateIds: string[]): RelicAggregate[] {
    return templateIds.map((templateId) => this.createRelicByTemplateUsingCurrentContext(templateId))
  }
  /** 透過 templateId 取得 RelicTemplate */
  private resolveTemplate(templateId: string): RelicTemplate {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const template = itemStore.getRelic(templateId)
    return template
  }
}
