import { CharacterAggregate, CharacterRecord } from '../../../../domain/character/Character'
import { RelicRecord } from '../../../../domain/item/Item'
import { Shop, ShopItemAggregate, ShopHelper } from '../../../../domain/shop/Shop'
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
    const relicRecords = shopContext.items.filter((record) => record.itemType === 'RELIC') as RelicRecord[]
    const itemAggregates = this.itemAggregateService.createRelicsByRecords(relicRecords)
    const shopConfig = this.configStoreAccessor.getConfigStore().shopStore.getShopConfig(shopContext.shopConfigId)

    // 重建 ShopItemAggregate，使用 ShopHelper 計算價格
    const shopItemAggregates: ShopItemAggregate[] = itemAggregates.map((aggregate) => {
      const price = ShopHelper.calculateItemPrice({
        config: shopConfig,
        difficulty: aggregate.record.atCreated.difficulty,
        rarity: aggregate.template.rarity,
        isBuying: true,
        isDiscounted: false,
      })
      return {
        itemAggregate: aggregate,
        price,
      }
    })

    return new Shop(shopItemAggregates, shopConfig)
  }
}
