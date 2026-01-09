import { Character, CharacterRecord } from '../../../../domain/character/Character'
import { RelicRecord } from '../../../../domain/item/Item'
import { Run } from '../../../../domain/run/Run'
import { Shop, ShopItemEntity } from '../../../../domain/shop/Shop'
import { Stash } from '../../../../domain/stash/Stash'
import { ICharacterAggregateService } from '../../../content-generation/service/character/CharacterAggregateService'
import { ItemEntityService } from '../../../content-generation/service/item/ItemEntityService'
import { IConfigStoreAccessor, IContextSnapshotAccessor } from '../service/AppContextService'
/**
 * 上下文轉換為領域模型的幫助器介面
 */
export interface IContextToDomainConverter {
  convertRunContextToDomain(): Run
  convertStashContextToDomain(): Stash
  convertCharacterContextToDomain(): Character
  convertShopContextToDomain(): Shop
}
/**
 * 上下文轉換為領域模型的幫助器
 */
export class ContextToDomainConverter implements IContextToDomainConverter {
  constructor(
    private itemEntityService: ItemEntityService,
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
    const itemEntities = this.itemEntityService.createRelicsByRecords(relicRecords)
    return new Stash(itemEntities, stashContext.capacity)
  }
  convertCharacterContextToDomain(): Character {
    const characterContext = this.contextAccessor.getCharacterContext()
    const characterRecord: CharacterRecord = { ...characterContext }
    return this.characterAggregateService.createOneByRecord(characterRecord)
  }
  convertShopContextToDomain(): Shop {
    const shopContext = this.contextAccessor.getShopContext()

    const shopConfig = this.configStoreAccessor.getConfigStore().shopStore.getShopConfig(shopContext.shopConfigId)

    const shopItemRecords = shopContext.items.filter((record) => record.itemType === 'RELIC')
    const itemEntities = this.itemEntityService.createRelicsByRecords(shopItemRecords)

    const shopItemEntities: ShopItemEntity[] = itemEntities.map((entity) => {
      const record = shopItemRecords.find((r) => r.id === entity.record.id)!
      return {
        itemEntity: entity,
        record: record,
      }
    })
    return new Shop(shopItemEntities, shopConfig)
  }
}
