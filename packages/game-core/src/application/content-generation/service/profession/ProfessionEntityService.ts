import { RelicTemplate } from '../../../../domain/item/Item'
import { ProfessionEntity, ProfessionTemplate } from '../../../../domain/profession/Profession'
import { UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import { IConfigStoreAccessor } from '../../../core-infrastructure/context/service/AppContextService'
/**
 * 職業聚合根服務：負責建立 ProfessionEntity
 * 職責：透過模板、大絕招聚合根、遺物聚合根與當前上下文組裝完整的職業聚合根
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )、IUltimateEntityService、IItemEntityService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IProfessionEntityService {
  /** 從模板與當前上下文建立 ProfessionEntity( 自動產生起始大絕招與遺物實例 ) */
  createOneByTemplateUsingCurrentContext(templateId: string): ProfessionEntity
}
export class ProfessionEntityService implements IProfessionEntityService {
  constructor(private configStoreAccessor: IConfigStoreAccessor) {}
  /** 從職業樣板與當前上下文建立 ProfessionEntity */
  createOneByTemplateUsingCurrentContext(templateId: string): ProfessionEntity {
    const professionTemplate = this.resolveProfessionTemplate(templateId)
    const relicTemplates = this.resolveRelicTemplates(professionTemplate.startRelicIds)
    const ultimateTemplates = this.resolveUltimateTemplates(professionTemplate.startUltimateIds)
    return new ProfessionEntity(templateId, professionTemplate, ultimateTemplates, relicTemplates)
  }
  /** 透過 templateId 取得 ProfessionTemplate */
  private resolveProfessionTemplate(templateId: string): ProfessionTemplate {
    const { professionStore } = this.configStoreAccessor.getConfigStore()
    const professionTemplate = professionStore.getProfession(templateId)
    return professionTemplate
  }
  /** 透過 templateIds 取得多個 RelicTemplate */
  private resolveRelicTemplates(templateIds: ReadonlyArray<string>): RelicTemplate[] {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const relicTemplates = itemStore.getManyRelics([...templateIds])
    return relicTemplates
  }
  /** 透過 templateIds 取得多個 UltimateTemplate */
  private resolveUltimateTemplates(templateIds: ReadonlyArray<string>): UltimateTemplate[] {
    const { ultimateStore } = this.configStoreAccessor.getConfigStore()
    const ultimateTemplates = ultimateStore.getUltimates([...templateIds])
    return ultimateTemplates
  }
}
