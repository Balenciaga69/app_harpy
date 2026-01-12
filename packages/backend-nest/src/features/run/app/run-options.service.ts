import { Injectable } from '@nestjs/common'
import { GameStartOptionsService } from 'src/from-game-core'
@Injectable()
export class RunOptionsService {
  constructor(private readonly gameStartOptionsService: GameStartOptionsService) {}
  getAvailableProfessions() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    return professions.map((prof) => ({
      id: prof.id,
      name: prof.name,
      desc: prof.desc,
    }))
  }
  getAllRelicTemplates() {
    const professions = this.gameStartOptionsService.getAvailableProfessions()
    const allRelics = professions.flatMap((prof) => this.gameStartOptionsService.getSelectableStartingRelics(prof.id))
    return allRelics.map((relic) => ({
      id: relic.id,
      name: relic.name,
      desc: relic.desc,
      itemType: relic.itemType,
      rarity: relic.rarity,
      affixIds: relic.affixIds,
      tags: relic.tags,
      loadCost: relic.loadCost,
      maxStacks: relic.maxStacks,
    }))
  }
  getSelectableStartingRelics(professionId: string) {
    const relics = this.gameStartOptionsService.getSelectableStartingRelics(professionId)
    return relics.map((relic) => ({
      id: relic.id,
      name: relic.name,
      desc: relic.desc,
      itemType: relic.itemType,
      rarity: relic.rarity,
      affixIds: relic.affixIds,
      tags: relic.tags,
      loadCost: relic.loadCost,
      maxStacks: relic.maxStacks,
    }))
  }
}
