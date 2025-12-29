import { ICharacterAggregateService } from '../content-generation/service/character/CharacterAggregateService'
import { ItemAggregateService } from '../content-generation/service/item/ItemAggregateService'
import { IContextToDomainConverter } from '../core-infrastructure/context/helper/ContextToDomainConverter'
import { IAppContextService } from '../core-infrastructure/context/service/AppContextService'
// 裝備服務 與 裝備服務介面
export interface IEquipmentService {
  /** 裝備物品到角色 */
}
export class EquipmentService implements IEquipmentService {
  constructor(
    private appContextService: IAppContextService,
    private itemAggregateService: ItemAggregateService,
    private characterAggregateService: ICharacterAggregateService,
    private contextToDomainConverter: IContextToDomainConverter
  ) {}
  // 從倉庫拿物品裝備到角色
  public methodA(relicId: string) {
    const stash = this.contextToDomainConverter.convertStashContextToDomain(this.appContextService)
    const character = this.contextToDomainConverter.convertCharacterContextToDomain(this.appContextService)
    // 中途有錯則拋錯
    // 卸下裝備
    const ch2 = character.unequipRelic(relicId)
    // 放入倉庫
    // stash.addItem(relicId)
    // 返回完成結果
  }
}
