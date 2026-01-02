import { Character, CharacterRecord } from '../../../../domain/character/Character'
import { IItemEntityService } from '../item/ItemEntityService'
import { IProfessionEntityService } from '../profession/ProfessionEntityService'
import { IUltimateEntityService } from '../ultimate/UltimateEntityService'
/** 角色聚合根服務介面 */
export interface ICharacterAggregateService {
  /** 從 CharacterRecord 與職業聚合根建立單一角色聚合根( 組裝現有記錄 ) */
  createOneByRecord(record: CharacterRecord): Character
}
/** 角色聚合根服務：負責建立 CharacterAggregate */
export class CharacterAggregateService implements ICharacterAggregateService {
  constructor(
    private professionEntityService: IProfessionEntityService,
    private itemEntityService: IItemEntityService,
    private ultimateEntityService: IUltimateEntityService
  ) {}
  /** 從 CharacterRecord 與職業聚合根建立 CharacterAggregate */
  createOneByRecord(record: CharacterRecord): Character {
    const profession = this.professionEntityService.createOneByTemplateUsingCurrentContext(record.professionId)
    const relics = this.itemEntityService.createRelicsByRecords(record.relics)
    const ultimate = this.ultimateEntityService.createOneByRecord(record.ultimate)
    return new Character(record, profession, relics, ultimate)
  }
}
