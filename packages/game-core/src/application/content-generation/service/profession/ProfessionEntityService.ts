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
  createOneByTemplateUsingCurrentContext(templateId: string): ProfessionEntity
}
export class ProfessionEntityService implements IProfessionEntityService {
  constructor(private configStoreAccessor: IConfigStoreAccessor) {}

  createOneByTemplateUsingCurrentContext(templateId: string): ProfessionEntity {
    const professionTemplate = this.resolveProfessionTemplate(templateId)
    const relicTemplates = this.resolveRelicTemplates(professionTemplate.startRelicIds)
    const ultimateTemplates = this.resolveUltimateTemplates(professionTemplate.startUltimateIds)
    return new ProfessionEntity(templateId, professionTemplate, ultimateTemplates, relicTemplates)
  }

  private resolveProfessionTemplate(templateId: string): ProfessionTemplate {
    const { professionStore } = this.configStoreAccessor.getConfigStore()
    const professionTemplate = professionStore.getProfession(templateId)
    return professionTemplate
  }

  private resolveRelicTemplates(templateIds: ReadonlyArray<string>): RelicTemplate[] {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const relicTemplates = itemStore.getManyRelics([...templateIds])
    return relicTemplates
  }

  private resolveUltimateTemplates(templateIds: ReadonlyArray<string>): UltimateTemplate[] {
    const { ultimateStore } = this.configStoreAccessor.getConfigStore()
    const ultimateTemplates = ultimateStore.getUltimates([...templateIds])
    return ultimateTemplates
  }
}
