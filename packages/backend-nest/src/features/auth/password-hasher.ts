import * as crypto from 'crypto'
export class PasswordHasher {
  private readonly iterations = 100000
  private readonly keyLength = 64
  private readonly algorithm = 'sha256'
  hash(password: string): string {
    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.algorithm).toString('hex')
    return `${salt}:${hash}`
  }
  verify(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':')
    if (!salt || !hash) {
      throw new Error('Invalid hash format')
    }
    const computedHash = crypto
      .pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.algorithm)
      .toString('hex')
    // 雿輻 timingSafeEqual ?脫迫???餅?
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash))
  }
}
