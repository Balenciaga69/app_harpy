import { CharacterAggregate, CharacterRecord } from '../../../../domain/character/Character'
import { RelicRecord } from '../../../../domain/item/Item'
import { Shop, ShopItemAggregate } from '../../../../domain/shop/Shop'
import { Stash } from '../../../../domain/stash/Stash'
import { ICharacterAggregateService } from '../../../content-generation/service/character/CharacterAggregateService'
import { ItemAggregateService } from '../../../content-generation/service/item/ItemAggregateService'
import { IConfigStoreAccessor, IContextSnapshotAccessor } from '../service/AppContextService'
/**
 * 上下文轉換為領域模型的幫助器介面
 */
export interface IContextToDomainConverter {
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
  convertStashContextToDomain(): Stash {
    const stashContext = this.contextAccessor.getStashContext()
    const relicRecords = stashContext.items.filter((s) => s.itemType === 'RELIC') as RelicRecord[]
    const itemAggregates = this.itemAggregateService.createRelicsByRecords(relicRecords)
    return new Stash(itemAggregates, stashContext.capacity)
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
    const itemAggregates = this.itemAggregateService.createRelicsByRecords(shopItemRecords)
    // 組合成商店物品聚合
    const shopItemAggregates: ShopItemAggregate[] = itemAggregates.map((aggregate) => {
      const record = shopItemRecords.find((r) => r.id === aggregate.record.id)!
      return {
        itemAggregate: aggregate,
        record: record,
      }
    })
    return new Shop(shopItemAggregates, shopConfig)
  }
}
