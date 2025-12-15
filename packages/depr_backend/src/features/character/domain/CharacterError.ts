export class CharacterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CharacterError'
  }
  /** 角色定義重複註冊 */
  static duplicateCharacterDefinition(id: string): CharacterError {
    return new CharacterError(`Character definition with id "${id}" already exists`)
  }
  /** 職業定義重複註冊 */
  static duplicateClassDefinition(id: string): CharacterError {
    return new CharacterError(`Class definition with id "${id}" already exists`)
  }
  /** 找不到角色定義 */
  static characterDefinitionNotFound(id: string): CharacterError {
    return new CharacterError(`Character definition with id "${id}" not found`)
  }
  /** 找不到職業定義 */
  static classDefinitionNotFound(id: string): CharacterError {
    return new CharacterError(`Class definition with id "${id}" not found`)
  }
  /** 無效的屬性值 */
  static invalidAttribute(characterId: string, attributeName: string, value: number): CharacterError {
    return new CharacterError(`Invalid attribute "${attributeName}" = ${value} for character "${characterId}"`)
  }
}
