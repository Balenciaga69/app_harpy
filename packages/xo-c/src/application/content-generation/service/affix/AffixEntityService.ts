import { AffixEntity, AffixRecord, AffixTemplate } from '../../../../domain/affix/Affix'
import { AffixEffect } from '../../../../domain/affix/effect/AffixEffectTemplate'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { AffixRecordFactory } from '../../factory/AffixFactory'
export interface IAffixEntityService {
  createOneByRecord(record: AffixRecord): AffixEntity
  createManyByRecords(records: AffixRecord[]): AffixEntity[]
  createOneByTemplateUsingCurrentContext(templateId: string): AffixEntity
  createManyByTemplateUsingCurrentContext(templateIds: string[]): AffixEntity[]
}
export class AffixEntityService implements IAffixEntityService {
  constructor(
    private readonly configStoreAccessor: IConfigStoreAccessor,
    private readonly contextSnapshot: IContextSnapshotAccessor
  ) {}
  createOneByRecord(record: AffixRecord): AffixEntity {
    const template = this.resolveTemplate(record.templateId)
    const effects = this.resolveEffects(template)
    return new AffixEntity(record, template, effects)
  }
  createManyByRecords(records: AffixRecord[]): AffixEntity[] {
    return records.map((r) => this.createOneByRecord(r))
  }
  createOneByTemplateUsingCurrentContext(templateId: string): AffixEntity {
    const template = this.resolveTemplate(templateId)
    const effects = this.resolveEffects(template)
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const record = AffixRecordFactory.createOne(templateId, currentInfo)
    return new AffixEntity(record, template, effects)
  }
  createManyByTemplateUsingCurrentContext(templateIds: string[]): AffixEntity[] {
    const currentInfo = this.contextSnapshot.getCurrentInfoForCreateRecord()
    const records = AffixRecordFactory.createMany(templateIds, currentInfo)
    return records.map((record) => {
      const template = this.resolveTemplate(record.templateId)
      const effects = this.resolveEffects(template)
      return new AffixEntity(record, template, effects)
    })
  }
  private resolveTemplate(templateId: string): AffixTemplate {
    const { affixStore } = this.configStoreAccessor.getConfigStore()
    const template = affixStore.getAffix(templateId)
    return template
  }
  private resolveEffects(template: AffixTemplate): AffixEffect[] {
    const { affixStore } = this.configStoreAccessor.getConfigStore()
    return template.effectIds.map((effectId) => {
      const effects = affixStore.getAffixEffect(effectId)
      return effects
    })
  }
}
