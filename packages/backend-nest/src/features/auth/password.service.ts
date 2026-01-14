import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10

  /**
   * 雜湊密碼
   * @param password 明文密碼
   * @returns 雜湊後的密碼
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  /**
   * 驗證密碼
   * @param password 明文密碼
   * @param hashedPassword 雜湊密碼
   * @returns 驗證是否成功
   */
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}
