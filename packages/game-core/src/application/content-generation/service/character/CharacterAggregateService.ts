import { Character, CharacterRecord } from '../../../../domain/character/Character'
import { IItemEntityService } from '../item/ItemEntityService'
import { IProfessionEntityService } from '../profession/ProfessionEntityService'
import { IUltimateEntityService } from '../ultimate/UltimateEntityService'

export interface ICharacterAggregateService {
  createOneByRecord(record: CharacterRecord): Character
}

export class CharacterAggregateService implements ICharacterAggregateService {
  constructor(
    private professionEntityService: IProfessionEntityService,
    private itemEntityService: IItemEntityService,
    private ultimateEntityService: IUltimateEntityService
  ) {}

  createOneByRecord(record: CharacterRecord): Character {
    const profession = this.professionEntityService.createOneByTemplateUsingCurrentContext(record.professionId)
    const relics = this.itemEntityService.createRelicsByRecords(record.relics)
    const ultimate = this.ultimateEntityService.createOneByRecord(record.ultimate)
    return new Character(record, profession, relics, ultimate)
  }
}
