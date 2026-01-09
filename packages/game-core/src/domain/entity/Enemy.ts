import { I18nField } from '../../shared/models/I18nField'
import { TemplateWeightInfo, WithChapter } from '../../shared/models/TemplateWeightInfo'
import { AffixEntity } from '../affix/Affix'
import { UltimateEntity } from '../ultimate/Ultimate'
export interface EnemySpawnInfo extends TemplateWeightInfo, WithChapter {}
export type EnemyRole = 'NORMAL' | 'ELITE' | 'BOSS'
export interface EnemyRoleConfig {
  affixIds: string[]
  ultimateId: string
}
export interface EnemyTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly roleConfigs: Record<EnemyRole, EnemyRoleConfig>
}
export class EnemyEntity {
  constructor(
    public readonly id: string,
    public readonly role: EnemyRole,
    public readonly template: EnemyTemplate,
    public readonly affixes: AffixEntity[],
    public readonly ultimate: UltimateEntity
  ) {}
}
