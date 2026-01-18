import { Type } from 'class-transformer'
import { GuestSession } from '../guest/guest-session.entity'

export class GuestSessionDto implements GuestSession {
  guestId!: string

  @Type(() => Date)
  createdAt!: Date

  @Type(() => Date)
  expiresAt!: Date
}
