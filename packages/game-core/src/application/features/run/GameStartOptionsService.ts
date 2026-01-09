import { RelicTemplate } from '../../../domain/item/Item'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { IProfessionStore } from '../../core-infrastructure/static-config/IConfigStores'
import { IItemStore } from '../../core-infrastructure/static-config/IConfigStores'
/**
 * 遊戲開始選項服務介面
 * 職責：提供玩家開始遊戲時的可選職業與對應 relic
 */
export interface IGameStartOptionsService {
  getAvailableProfessions(): ProfessionTemplate[]

  getSelectableStartingRelics(professionId: string): RelicTemplate[]
}
/**
 * 遊戲開始選項服務：提供初始化選項
 * 職責：從配置存儲中檢索職業與 relic 選項
 */
export class GameStartOptionsService implements IGameStartOptionsService {
  constructor(
    private professionStore: IProfessionStore,
    private itemStore: IItemStore
  ) {}
  getAvailableProfessions(): ProfessionTemplate[] {
    return this.professionStore.getAllProfessions()
  }
  getSelectableStartingRelics(professionId: string): RelicTemplate[] {
    const profession = this.professionStore.getProfession(professionId)
    if (!profession) {
      throw new Error(`Profession not found: ${professionId}`)
    }
    return this.itemStore.getManyRelics([...profession.startRelicIds])
  }
}
