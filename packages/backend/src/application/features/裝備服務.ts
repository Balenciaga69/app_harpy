import { RelicRecord } from '../../domain/item/Item'
import { Stash } from '../../domain/stash/Stash'
import { ItemAggregateService } from '../content-generation/service/item/ItemAggregateService'
import { IAppContextService, IContextSnapshotAccessor } from '../core-infrastructure/context/service/AppContextService'

// 裝備服務 與 裝備服務介面
export interface IEquipmentService {
  /** 裝備物品到角色 */
}

export class EquipmentService implements IEquipmentService {
  constructor(
    private snapshotAccessor: IContextSnapshotAccessor,
    private itemAggregateService: ItemAggregateService
  ) {}
  // 從倉庫拿物品裝備到角色
  public methodA() {
    //  const { stashContext, characterContext } = this.snapshotAccessor.getAllContexts()
    // stashContext.
  }

  private stashContextToDomainModel() {
    const stashContext = this.snapshotAccessor.getStashContext()
    //
    //  const isType = <T>(item: any): item is T => !!item
    //  const relics = stashContext.items.filter<RelicRecord>()
    //  const itemAggregates = this.itemAggregateService.createRelicsByRecords(relics)
    //  const stash = new Stash(itemAggregates, stashContext.capacity)
  }
}
