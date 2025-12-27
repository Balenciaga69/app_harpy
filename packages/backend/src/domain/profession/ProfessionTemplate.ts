import { I18nField } from '../../shared/models/I18nField'
import { RelicAggregate } from '../item/Item'
import { UltimateAggregate } from '../ultimate/Ultimate'
/** 職業樣板，定義玩家職業的起始大絕招與遺物 */
export interface ProfessionTemplate {
  id: string
  name: I18nField
  desc: I18nField
  startUltimateIds: string[]
  startRelicIds: string[]
}
/** 職業聚合，包含職業樣板與起始大絕招與遺物的實例 */
export class ProfessionAggregate {
  constructor(
    public readonly id: string,
    public readonly template: ProfessionTemplate,
    public readonly ultimateAggregates: ReadonlyArray<UltimateAggregate>,
    public readonly relicAggregates: ReadonlyArray<RelicAggregate>
  ) {}
}
