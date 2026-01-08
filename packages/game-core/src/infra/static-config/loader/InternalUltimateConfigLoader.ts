import {
  IUltimateConfigLoader,
  UltimateConfigDTO,
} from '../../../application/core-infrastructure/static-config/IConfigLoaders'
import { UltimateTemplateList } from '../../../data/ultimate/ultimate.data'
export class InternalUltimateConfigLoader implements IUltimateConfigLoader {
  async load(): Promise<UltimateConfigDTO> {
    const dto: UltimateConfigDTO = {
      ultimateTemplates: UltimateTemplateList,
    }
    return Promise.resolve(dto)
  }
}
