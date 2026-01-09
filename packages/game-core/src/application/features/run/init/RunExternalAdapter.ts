import { RelicTemplate } from '../../../../domain/item/Item'
import { ProfessionTemplate } from '../../../../domain/profession/Profession'
import { UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import { IAppContext } from '../../../core-infrastructure/context/interface/IAppContext'

export interface IRunExternalAdapter {
  getProfession(professionId: string): ProfessionTemplate | undefined
  getRelic(relicId: string): RelicTemplate | undefined
  getUltimate(ultimateId: string): UltimateTemplate | undefined
  getConfigStore(): IAppContext['configStore']
}

export class AppContextRunAdapter implements IRunExternalAdapter {
  constructor(private readonly configStore: IAppContext['configStore']) {}
  getProfession(professionId: string) {
    return this.configStore.professionStore.getProfession(professionId)
  }
  getRelic(relicId: string) {
    return this.configStore.itemStore.getRelic(relicId)
  }
  getUltimate(ultimateId: string) {
    return this.configStore.ultimateStore.getUltimate(ultimateId)
  }
  getConfigStore(): IAppContext['configStore'] {
    return this.configStore
  }
}
