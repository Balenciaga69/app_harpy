import { CharacterManagerError } from './CharacterManagerError'

// 角色未找到錯誤
export class CharacterNotFoundError extends CharacterManagerError {
  constructor(characterId: string) {
    super(`Character not found: ${characterId}`)
    this.name = 'CharacterNotFoundError'
    Object.setPrototypeOf(this, CharacterNotFoundError.prototype)
  }
}
