// 角色管理器基礎錯誤類別
export class CharacterManagerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CharacterManagerError'
    Object.setPrototypeOf(this, CharacterManagerError.prototype)
  }
}
