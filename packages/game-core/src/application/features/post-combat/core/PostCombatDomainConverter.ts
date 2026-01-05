import { Character } from '../../../../domain/character/Character'
import { Stash } from '../../../../domain/stash/Stash'
import { ICharacterAggregateService } from '../../../content-generation/service/character/CharacterAggregateService'
import { ItemEntityService } from '../../../content-generation/service/item/ItemEntityService'
import { IContextSnapshotAccessor } from '../../../core-infrastructure/context/service/AppContextService'

/**
 * 戰鬥後上下文轉換為領域模型
 * 職責：純粹的轉換邏輯，將上下文轉換為領域實體
 */
export interface IPostCombatDomainConverter {
  convertCharacterContextToDomain(): Character
  convertStashContextToDomain(): Stash
}

export class PostCombatDomainConverter implements IPostCombatDomainConverter {
  constructor(
    private contextAccessor: IContextSnapshotAccessor,
    private itemEntityService: ItemEntityService,
    private characterAggregateService: ICharacterAggregateService
  ) {}

  public convertCharacterContextToDomain(): Character {
    const characterContext = this.contextAccessor.getCharacterContext()
    return this.characterAggregateService.createOneByRecord({ ...characterContext })
  }

  public convertStashContextToDomain(): Stash {
    const stashContext = this.contextAccessor.getStashContext()
    const relicRecords = stashContext.items.filter((s) => s.itemType === 'RELIC')
    const itemEntities = this.itemEntityService.createRelicsByRecords(relicRecords)
    return new Stash(itemEntities, stashContext.capacity)
  }
}
