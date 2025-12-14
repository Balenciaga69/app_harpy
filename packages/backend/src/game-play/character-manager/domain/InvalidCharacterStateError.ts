import { CharacterManagerError } from './CharacterManagerError'

// 無效角色狀態錯誤
export class InvalidCharacterStateError extends CharacterManagerError {
  constructor(characterId: string, reason: string) {
    super(`Invalid character state for ${characterId}: ${reason}`)
    this.name = 'InvalidCharacterStateError'
    Object.setPrototypeOf(this, InvalidCharacterStateError.prototype)
  }
}
