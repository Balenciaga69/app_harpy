import { CharacterRecord } from '../../../../domain/character/Character'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface ICharacterContext extends WithRunIdAndVersion, CharacterRecord {}
