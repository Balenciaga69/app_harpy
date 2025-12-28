import { RelicAggregate } from '../../../../domain/item/Item'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { IAffixAggregateService } from '../affix/AffixAggregateService'

/**
 * 物品聚合根服務：負責建立 RelicAggregate
 * 職責：透過模板、詞綴聚合根與當前上下文組裝完整的遺物聚合根
 * 依賴：IConfigStoreAccessor（讀模板）、IContextSnapshotAccessor（讀難度資訊）、IAffixAggregateService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IItemAggregateService {
  /** 從模板與當前上下文建立 RelicAggregate（自動產生記錄與詞綴） */
  createRelicByTemplateUsingCurrentContext(templateId: string): RelicAggregate
}

export class ItemAggregateService implements IItemAggregateService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private affixAggregateService: IAffixAggregateService
  ) {}

  /** 從遺物模板與當前上下文建立 RelicAggregate */
  createRelicByTemplateUsingCurrentContext(templateId: string) {
    const relicTemplate = this.resolveTemplate(templateId)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const affixAggregates = this.affixAggregateService.createManyByTemplateUsingCurrentContext([
      ...relicTemplate.affixIds,
    ])
    const record = RelicRecordFactory.createOne(templateId, {
      currentStacks: 0,
      affixRecords: affixAggregates.map((a) => a.record),
      ...currentInfo,
    })
    return new RelicAggregate(record, relicTemplate, affixAggregates)
  }

  /** 透過 templateId 取得 RelicTemplate */
  private resolveTemplate(templateId: string) {
    const template = this.configStoreAccessor.getConfigStore().itemStore.getRelic(templateId)
    if (!template) {
      throw new Error(`樣板不存在: ${templateId}`)
    }
    return template
  }
}
