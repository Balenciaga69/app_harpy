import { Type } from 'class-transformer'
import { RefreshTokenRecord } from '../token/refresh-token-record.entity'
export class RefreshTokenRecordDto implements RefreshTokenRecord {
  jti!: string
  userId!: string
  deviceId?: string
  @Type(() => Date)
  createdAt!: Date
  @Type(() => Date)
  expiresAt!: Date
}
