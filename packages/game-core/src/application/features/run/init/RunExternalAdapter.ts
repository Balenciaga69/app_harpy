import { RelicTemplate } from '../../../../domain/item/Item'
import { ProfessionTemplate } from '../../../../domain/profession/Profession'
import { UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import { IAppContext } from '../../../core-infrastructure/context/interface/IAppContext'
/**
 * 防腐層介面：將外部配置源（configStore 等）隔離，保證核心邏輯不直接依賴外部實作
 */
export interface IRunExternalAdapter {
  getProfession(professionId: string): ProfessionTemplate | undefined
  getRelic(relicId: string): RelicTemplate | undefined
  getUltimate(ultimateId: string): UltimateTemplate | undefined
  getConfigStore(): IAppContext['configStore']
}
/**
 * 把現有的 configStore 適配成 IRunExternalAdapter
 */
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
