import { RelicAggregate } from '../../../../domain/item/Item'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
import { RelicRecordFactory } from '../../factory/RelicFactory'
import { IAffixAggregateService } from '../affix/AffixAggregateService'
// 定義 ItemAggregate 服務介面
export interface IItemAggregateService {
  createRelicByTemplateUsingCurrentContext(templateId: string): RelicAggregate
}
// 提供建立 ItemAggregate 的服務
export class ItemAggregateService {
  constructor(
    private appContextService: IAppContextService,
    private affixAggregateService: IAffixAggregateService
  ) {}
  // 從樣板與當前上下文建立 RelicAggregate
  createRelicByTemplateUsingCurrentContext(templateId: string) {
    const relicTemplate = this.resolveTemplate(templateId)
    const currentInfo = this.appContextService.getCurrentInfoForCreateRecord()
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
  private resolveTemplate(templateId: string) {
    const template = this.appContextService.getConfigStore().itemStore.getRelic(templateId)
    if (!template) {
      throw new Error(`樣板不存在: ${templateId}`)
    }
    return template
  }
}
