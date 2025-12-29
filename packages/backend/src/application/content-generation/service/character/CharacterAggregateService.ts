import { CharacterAggregate, CharacterRecord } from '../../../../domain/character/Character'
import { IItemAggregateService } from '../item/ItemAggregateService'
import { IProfessionAggregateService } from '../profession/ProfessionAggregateService'
import { IUltimateAggregateService } from '../ultimate/UltimateAggregateService'

/** 角色聚合根服務介面 */
export interface ICharacterAggregateService {
  /** 從 CharacterRecord 與職業聚合根建立單一角色聚合根( 組裝現有記錄 ) */
  createOneByRecord(record: CharacterRecord): CharacterAggregate
}
/** 角色聚合根服務：負責建立 CharacterAggregate */
export class CharacterAggregateService implements ICharacterAggregateService {
  constructor(
    private professionAggregateService: IProfessionAggregateService,
    private itemAggregateService: IItemAggregateService,
    private ultimateAggregateService: IUltimateAggregateService
  ) {}

  /** 從 CharacterRecord 與職業聚合根建立 CharacterAggregate */
  createOneByRecord(record: CharacterRecord): CharacterAggregate {
    const profession = this.professionAggregateService.createOneByTemplateUsingCurrentContext(record.professionId)
    const relicAggregates = this.itemAggregateService.createRelicsByRecords(record.relics)
    const ultimateAggregate = this.ultimateAggregateService.createOneByRecord(record.ultimate)
    return new CharacterAggregate(record, profession, relicAggregates, ultimateAggregate)
  }
}
