import { ProfessionTemplate } from '../../../../domain/profession/ProfessionTemplate'

/** 職業配置資料傳輸物件 */
export interface ProfessionConfigDTO {
  professionTemplates: ProfessionTemplate[]
}

/** 職業配置加載器介面 */
export interface IProfessionConfigLoader {
  /** 加載職業配置 */
  load(): Promise<ProfessionConfigDTO>
}
