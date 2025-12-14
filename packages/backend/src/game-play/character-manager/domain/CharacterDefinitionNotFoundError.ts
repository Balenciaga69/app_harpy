import { CharacterManagerError } from './CharacterManagerError'

// 角色定義未找到錯誤
export class CharacterDefinitionNotFoundError extends CharacterManagerError {
  constructor(definitionId: string) {
    super(`Character definition not found: ${definitionId}`)
    this.name = 'CharacterDefinitionNotFoundError'
    Object.setPrototypeOf(this, CharacterDefinitionNotFoundError.prototype)
  }
}
