import { CharacterAggregate, CharacterRecord } from '../../../../domain/character/Character'
import { RelicRecord } from '../../../../domain/item/Item'
import { Run } from '../../../../domain/run/Run'
import { Shop, ShopItemEntity } from '../../../../domain/shop/Shop'
import { Stash } from '../../../../domain/stash/Stash'
import { ICharacterAggregateService } from '../../../content-generation/service/character/CharacterAggregateService'
import { ItemAggregateService } from '../../../content-generation/service/item/ItemAggregateService'
import { IConfigStoreAccessor, IContextSnapshotAccessor } from '../service/AppContextService'
/**
 * 上下文轉換為領域模型的幫助器介面
 */
export interface IContextToDomainConverter {
  convertRunContextToDomain(): Run
  convertStashContextToDomain(): Stash
  convertCharacterContextToDomain(): CharacterAggregate
  convertShopContextToDomain(): Shop
}
/**
 * 上下文轉換為領域模型的幫助器
 */
export class ContextToDomainConverter implements IContextToDomainConverter {
  constructor(
    private itemAggregateService: ItemAggregateService,
    private characterAggregateService: ICharacterAggregateService,
    private contextAccessor: IContextSnapshotAccessor,
    private configStoreAccessor: IConfigStoreAccessor
  ) {}
  convertRunContextToDomain(): Run {
    const runContext = this.contextAccessor.getRunContext()
    return new Run(runContext)
  }
  convertStashContextToDomain(): Stash {
    const stashContext = this.contextAccessor.getStashContext()
    const relicRecords = stashContext.items.filter((s) => s.itemType === 'RELIC') as RelicRecord[]
    const itemEntitys = this.itemAggregateService.createRelicsByRecords(relicRecords)
    return new Stash(itemEntitys, stashContext.capacity)
  }
  convertCharacterContextToDomain(): CharacterAggregate {
    const characterContext = this.contextAccessor.getCharacterContext()
    const characterRecord: CharacterRecord = { ...characterContext }
    return this.characterAggregateService.createOneByRecord(characterRecord)
  }
  convertShopContextToDomain(): Shop {
    const shopContext = this.contextAccessor.getShopContext()
    // 取得商店配置
    const shopConfig = this.configStoreAccessor.getConfigStore().shopStore.getShopConfig(shopContext.shopConfigId)
    // 透過物品記錄建立物品聚合
    const shopItemRecords = shopContext.items.filter((record) => record.itemType === 'RELIC')
    const itemEntitys = this.itemAggregateService.createRelicsByRecords(shopItemRecords)
    // 組合成商店物品實體
    const shopItemEntitys: ShopItemEntity[] = itemEntitys.map((aggregate) => {
      const record = shopItemRecords.find((r) => r.id === aggregate.record.id)!
      return {
        itemEntity: aggregate,
        record: record,
      }
    })
    return new Shop(shopItemEntitys, shopConfig)
  }
}
