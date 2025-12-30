import { CharacterAggregate, CharacterRecord } from '../../../../domain/character/Character'
import { RelicRecord } from '../../../../domain/item/Item'
import { Stash } from '../../../../domain/stash/Stash'
import { ICharacterAggregateService } from '../../../content-generation/service/character/CharacterAggregateService'
import { ItemAggregateService } from '../../../content-generation/service/item/ItemAggregateService'
import { IContextSnapshotAccessor } from '../service/AppContextService'
/**
 * 上下文轉換為領域模型的幫助器介面
 */
export interface IContextToDomainConverter {
  convertStashContextToDomain(): Stash
  convertCharacterContextToDomain(): CharacterAggregate
}
/**
 * 上下文轉換為領域模型的幫助器
 */
export class ContextToDomainConverter implements IContextToDomainConverter {
  constructor(
    private itemAggregateService: ItemAggregateService,
    private characterAggregateService: ICharacterAggregateService,
    private contextAccessor: IContextSnapshotAccessor
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
}
