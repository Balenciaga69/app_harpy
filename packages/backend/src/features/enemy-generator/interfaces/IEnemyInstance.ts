import type { ICharacterInstance } from '../../../game-play/character-manager'

export interface IEnemyInstance {
  character: ICharacterInstance
  definitionId: string
  difficulty: number
  equipmentIds: string[]
  relicIds: string[]
  threatLevel: number
}
