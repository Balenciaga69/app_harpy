import { I18nField } from '../../shared/models/I18nField'
import { RelicTemplate } from '../item/Item'
import { UltimateTemplate } from '../ultimate/Ultimate'
export type ProfessionType = 'WARRIOR' | 'MAGE' | 'RANGER'
export interface ProfessionTemplate {
  id: ProfessionType
  name: I18nField
  desc: I18nField
  startUltimateIds: ReadonlyArray<string>
  startRelicIds: ReadonlyArray<string>
}
export class ProfessionEntity {
  constructor(
    public readonly id: string,
    public readonly template: ProfessionTemplate,
    public readonly ultimateTemplates: ReadonlyArray<UltimateTemplate>,
    public readonly relicTemplates: ReadonlyArray<RelicTemplate>
  ) {}
}
