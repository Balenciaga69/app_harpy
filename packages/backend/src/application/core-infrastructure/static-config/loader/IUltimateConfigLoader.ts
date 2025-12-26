import { UltimateTemplate } from '../../../../domain/ultimate/UltimateTemplate'

/** 大絕招配置資料傳輸物件 */
export interface UltimateConfigDTO {
  ultimateTemplates: UltimateTemplate[]
}

/** 大絕招配置加載器介面 */
export interface IUltimateConfigLoader {
  /** 加載大絕招配置 */
  load(): Promise<UltimateConfigDTO>
}
