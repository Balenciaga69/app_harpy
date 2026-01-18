import { Type } from 'class-transformer'
import { AccessTokenRecord } from '../token/access-token-record.entity'
export class AccessTokenRecordDto implements AccessTokenRecord {
  jti!: string
  userId!: string
  deviceId!: string
  @Type(() => Date)
  createdAt!: Date
  @Type(() => Date)
  expiresAt!: Date
}
