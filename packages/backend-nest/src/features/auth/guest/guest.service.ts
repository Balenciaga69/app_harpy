import { Injectable } from '@nestjs/common'
import { nanoid } from 'nanoid'
import { GuestSession } from './guest-session.entity'
import { RedisGuestRepository } from './guest.repository'
@Injectable()
export class GuestService {
  private readonly SESSION_TTL_SECONDS = 3600
  constructor(private readonly guestRepository: RedisGuestRepository) {}
  async createGuestSession(): Promise<{
    guestId: string
    expiresAt: Date
  }> {
    const guestId = nanoid()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.SESSION_TTL_SECONDS * 1000)
    const session: GuestSession = {
      guestId,
      createdAt: now,
      expiresAt,
    }
    await this.guestRepository.save(session)
    return { guestId, expiresAt }
  }
  async validateGuestId(guestId: string): Promise<GuestSession | null> {
    const session = await this.guestRepository.findByGuestId(guestId)
    if (!session) {
      return null
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await this.guestRepository.deleteByGuestId(guestId)
      return null
    }
    return session
  }
  async extendGuestSession(guestId: string): Promise<Date | null> {
    const session = await this.validateGuestId(guestId)
    if (!session) {
      return null
    }
    const newExpiresAt = new Date(Date.now() + this.SESSION_TTL_SECONDS * 1000)
    await this.guestRepository.updateExpiresAt(guestId, newExpiresAt)
    return newExpiresAt
  }
  async deleteGuestSession(guestId: string): Promise<void> {
    await this.guestRepository.deleteByGuestId(guestId)
  }
}
