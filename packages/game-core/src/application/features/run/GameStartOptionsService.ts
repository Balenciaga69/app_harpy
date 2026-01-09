import { RelicTemplate } from '../../../domain/item/Item'
import { ProfessionTemplate } from '../../../domain/profession/Profession'
import { IProfessionStore } from '../../core-infrastructure/static-config/IConfigStores'
import { IItemStore } from '../../core-infrastructure/static-config/IConfigStores'
export interface IGameStartOptionsService {
  getAvailableProfessions(): ProfessionTemplate[]
  getSelectableStartingRelics(professionId: string): RelicTemplate[]
}
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
