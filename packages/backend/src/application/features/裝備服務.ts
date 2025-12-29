import { CharacterAggregate, CharacterRecord } from '../../domain/character/Character'
import { RelicRecord } from '../../domain/item/Item'
import { Stash } from '../../domain/stash/Stash'
import { ICharacterAggregateService } from '../content-generation/service/character/CharacterAggregateService'
import { ItemAggregateService } from '../content-generation/service/item/ItemAggregateService'
import { IAppContextService, IContextSnapshotAccessor } from '../core-infrastructure/context/service/AppContextService'

// 裝備服務 與 裝備服務介面
export interface IEquipmentService {
  /** 裝備物品到角色 */
}

export class EquipmentService implements IEquipmentService {
  constructor(
    private snapshotAccessor: IContextSnapshotAccessor,
    private itemAggregateService: ItemAggregateService,
    private characterAggregateService: ICharacterAggregateService
  ) {}
  // 從倉庫拿物品裝備到角色
  public methodA() {
    const stash = this.convertStashContextToDomain()
    //  const { stashContext, characterContext } = this.snapshotAccessor.getAllContexts()
    // stashContext.
  }
  // 轉換倉庫上下文到倉庫聚合根
  private convertStashContextToDomain() {
    const stashContext = this.snapshotAccessor.getStashContext()
    const relicRecords = stashContext.items.filter((s) => s.itemType === 'RELIC') as RelicRecord[]
    const itemAggregates = this.itemAggregateService.createRelicsByRecords(relicRecords)
    const stash = new Stash(itemAggregates, stashContext.capacity)
    return stash
  }
  // 轉換角色上下文到角色聚合根
  private convertCharacterContextToDomain() {
    const characterContext = this.snapshotAccessor.getCharacterContext()
    const { currentLoad, id, loadCapacity, name, professionId, relics, ultimate } = characterContext
    const characterRecord: CharacterRecord = { currentLoad, id, loadCapacity, name, professionId, relics, ultimate }
    const character = this.characterAggregateService.createOneByRecord(characterRecord)
    return character
  }
}
