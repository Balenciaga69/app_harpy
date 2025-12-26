import {
  ProfessionConfigDTO,
  IProfessionConfigLoader,
} from '../../application/core-infrastructure/static-config/loader/IConfigLoaders'
import { ProfessionTemplateList } from '../../data/profession/profession.data'
export class InternalProfessionConfigLoader implements IProfessionConfigLoader {
  async load(): Promise<ProfessionConfigDTO> {
    const dto: ProfessionConfigDTO = {
      professionTemplates: ProfessionTemplateList,
    }
    return Promise.resolve(dto)
  }
}
