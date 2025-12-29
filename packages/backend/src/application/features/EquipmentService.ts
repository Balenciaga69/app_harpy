import { RelicAggregate } from '../../domain/item/Item'
import { IContextToDomainConverter } from '../core-infrastructure/context/helper/ContextToDomainConverter'
import { IAppContextService } from '../core-infrastructure/context/service/AppContextService'
// 裝備服務 與 裝備服務介面
export interface IEquipmentService {
  /** 裝備物品到角色 */
}
export class EquipmentService implements IEquipmentService {
  constructor(
    private appContextService: IAppContextService,
    private contextToDomainConverter: IContextToDomainConverter
  ) {}
  // 卸下角色遺物至倉庫
  public unequipRelicAndUpdateContexts(relicId: string) {
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    const targetRelicAggregate = character.getRelic(relicId)
    // 卸下裝備
    const newCharacter = character.unequipRelic(relicId)
    if (!newCharacter) {
      throw new Error('Failed to unequip relic')
    }
    // 放入倉庫
    const newStash = stash.addItem(targetRelicAggregate)
    if (!newStash) {
      throw new Error('Failed to add item to stash')
    }
    // 返回 各自 context
    const characterContext = this.appContextService.getCharacterContext()
    this.appContextService.setCharacterContext({ ...characterContext, ...newCharacter.record })
    const stashContext = this.appContextService.getStashContext()
    this.appContextService.setStashContext({ ...stashContext, items: newStash.listItems().map((i) => i.record) })
  }
  // 從倉庫裝備遺物到角色
  public equipRelicAndUpdateContexts(relicId: string) {
    const stash = this.contextToDomainConverter.convertStashContextToDomain()
    const character = this.contextToDomainConverter.convertCharacterContextToDomain()
    const targetRelicAggregate = stash.getItem(relicId)
    if (!targetRelicAggregate) {
      throw new Error('Relic not found in stash')
    }
    // 從倉庫移除
    const newStash = stash.removeItem(relicId)
    if (!newStash) {
      throw new Error('Failed to remove item from stash')
    }
    // 裝備遺物
    const newCharacter = character.equipRelic(targetRelicAggregate as RelicAggregate)
    if (!newCharacter) {
      throw new Error('Failed to equip relic')
    }
    // 返回 各自 context
    const characterContext = this.appContextService.getCharacterContext()
    this.appContextService.setCharacterContext({ ...characterContext, ...newCharacter.record })
    const stashContext = this.appContextService.getStashContext()
    this.appContextService.setStashContext({ ...stashContext, items: newStash.listItems().map((i) => i.record) })
  }
}
