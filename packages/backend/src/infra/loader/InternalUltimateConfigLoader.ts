import {
  UltimateConfigDTO,
  IUltimateConfigLoader,
} from '../../application/core-infrastructure/static-config/loader/IUltimateConfigLoader'
import { UltimateTemplateList } from '../../data/ultimate/ultimate.data'
export class InternalUltimateConfigLoader implements IUltimateConfigLoader {
  async load(): Promise<UltimateConfigDTO> {
    const dto: UltimateConfigDTO = {
      ultimateTemplates: UltimateTemplateList,
    }
    return Promise.resolve(dto)
  }
}
