import { Inject, Injectable } from '@nestjs/common'
import { nanoid } from 'nanoid'
import { ApiErrorCode } from 'src/features/shared/errors/ApiErrorCode'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { Result } from 'src/from-xo-c'
import { IGuestRepository } from '../contracts'
import { GuestSession } from './guest-session.entity'
import { SessionExpirationPolicy } from './session-expiration.policy'
@Injectable()
export class GuestService {
  constructor(
    @Inject(InjectionTokens.GuestRepository)
    private readonly guestRepository: IGuestRepository,
    private readonly expirationPolicy: SessionExpirationPolicy
  ) {}
  async createGuestSession(): Promise<{
    guestId: string
    expiresAt: Date
  }> {
    const guestId = nanoid()
    const now = new Date()
    const expiresAt = this.expirationPolicy.calculateExpiresAt()
    const session: GuestSession = {
      guestId,
      createdAt: now,
      expiresAt,
    }
    await this.guestRepository.save(session)
    return { guestId, expiresAt }
  }
  async validateGuestId(guestId: string): Promise<Result<GuestSession>> {
    const session = await this.guestRepository.findByGuestId(guestId)
    if (!session) {
      return Result.fail(ApiErrorCode.認證_認證無效)
    }
    if (this.expirationPolicy.isExpired(session.expiresAt)) {
      await this.guestRepository.deleteByGuestId(guestId)
      return Result.fail(ApiErrorCode.認證_令牌過期)
    }
    return Result.success(session)
  }
  async extendGuestSession(guestId: string): Promise<Result<Date>> {
    const result = await this.validateGuestId(guestId)
    if (result.isFailure) {
      return Result.fail(result.error!)
    }
    const session = result.value!
    // 防止無限延長
    if (this.expirationPolicy.isMaxLifetimeExceeded(session.createdAt)) {
      await this.guestRepository.deleteByGuestId(guestId)
      return Result.fail(ApiErrorCode.認證_令牌過期)
    }
    const newExpiresAt = this.expirationPolicy.calculateExpiresAt()
    await this.guestRepository.updateExpiresAt(guestId, newExpiresAt)
    return Result.success(newExpiresAt)
  }
  async deleteGuestSession(guestId: string): Promise<void> {
    await this.guestRepository.deleteByGuestId(guestId)
  }
}
