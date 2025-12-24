import { ProfessionTemplate } from '../../../../domain/profession/ProfessionTemplate'

export interface ProfessionConfigDTO {
  professionTemplates: ProfessionTemplate[]
}

export interface IProfessionConfigLoader {
  load(): Promise<ProfessionConfigDTO>
}
