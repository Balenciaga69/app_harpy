import { RelicTemplate } from '../../../../domain/item/Item'
import { ProfessionAggregate, ProfessionTemplate } from '../../../../domain/profession/Profession'
import { UltimateTemplate } from '../../../../domain/ultimate/Ultimate'
import { IAppContextService } from '../../../core-infrastructure/context/service/AppContextService'
/**
 * 職業聚合根服務：負責建立 ProfessionAggregate
 * 職責：透過模板、大絕招聚合根、遺物聚合根與當前上下文組裝完整的職業聚合根
 * 依賴：IConfigStoreAccessor( 讀模板 )、IContextSnapshotAccessor( 讀難度資訊 )、IUltimateAggregateService、IItemAggregateService
 * 邊界：純建立邏輯，不涉及狀態修改
 */
export interface IProfessionAggregateService {
  /** 從模板與當前上下文建立 ProfessionAggregate( 自動產生起始大絕招與遺物實例 ) */
  createOneByTemplateUsingCurrentContext(templateId: string): ProfessionAggregate
}
export class ProfessionAggregateService implements IProfessionAggregateService {
  constructor(private appContextService: IAppContextService) {}
  /** 從職業樣板與當前上下文建立 ProfessionAggregate */
  createOneByTemplateUsingCurrentContext(templateId: string): ProfessionAggregate {
    const professionTemplate = this.resolveProfessionTemplate(templateId)
    const relicTemplates = this.resolveRelicTemplates(professionTemplate.startRelicIds)
    const ultimateTemplates = this.resolveUltimateTemplates(professionTemplate.startUltimateIds)
    return new ProfessionAggregate(templateId, professionTemplate, ultimateTemplates, relicTemplates)
  }
  /** 透過 templateId 取得 ProfessionTemplate */
  private resolveProfessionTemplate(templateId: string): ProfessionTemplate {
    const { professionStore } = this.appContextService.getConfigStore()
    const professionTemplate = professionStore.getProfession(templateId)
    return professionTemplate
  }
  /** 透過 templateIds 取得多個 RelicTemplate */
  private resolveRelicTemplates(templateIds: string[]): RelicTemplate[] {
    const { itemStore } = this.appContextService.getConfigStore()
    const relicTemplates = itemStore.getManyRelics(templateIds)
    return relicTemplates
  }
  /** 透過 templateIds 取得多個 UltimateTemplate */
  private resolveUltimateTemplates(templateIds: string[]): UltimateTemplate[] {
    const { ultimateStore } = this.appContextService.getConfigStore()
    const ultimateTemplates = ultimateStore.getUltimates(templateIds)
    return ultimateTemplates
  }
}
