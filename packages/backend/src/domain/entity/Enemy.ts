import { I18nField } from '../../shared/models/I18nField'
import { TemplateWeightInfo, WithChapter } from '../../shared/models/TemplateWeightInfo'
import { AffixAggregate } from '../affix/Affix'
import { UltimateAggregate } from '../ultimate/Ultimate'
/** 敵人生成資訊，描述敵人出現的權重與進度約束 */
export interface EnemySpawnInfo extends TemplateWeightInfo, WithChapter {}
/** 敵人難度角色，決定敵人的詞綴與大絕招配置 */
export type EnemyRole = 'NORMAL' | 'ELITE' | 'BOSS'
/** 敵人難度配置，定義不同難度敵人的詞綴與大絕招集合 */
export interface EnemyRoleConfig {
  affixIds: string[]
  ultimateId: string
}
/** 敵人樣板，定義敵人的靜態屬性與根據難度的配置 */
export interface EnemyTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly roleConfigs: Record<EnemyRole, EnemyRoleConfig>
}
/** 敵人聚合，包含敵人的樣板與根據難度生成的詞綴與大絕招 */
export class EnemyAggregate {
  constructor(
    public readonly id: string,
    public readonly role: EnemyRole,
    public readonly template: EnemyTemplate,
    public readonly affixes: AffixAggregate[],
    public readonly ultimate: UltimateAggregate
  ) {}
}
