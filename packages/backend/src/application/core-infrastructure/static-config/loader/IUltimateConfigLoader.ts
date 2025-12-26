import { UltimateTemplate } from '../../../../domain/ultimate/UltimateTemplate'
export interface UltimateConfigDTO {
  ultimateTemplates: UltimateTemplate[]
}
export interface IUltimateConfigLoader {
  load(): Promise<UltimateConfigDTO>
}
