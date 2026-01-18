import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { nanoid } from 'nanoid'
import { ApiErrorCode } from 'src/features/shared/errors/ApiErrorCode'
import { InjectionTokens } from 'src/features/shared/providers/injection-tokens'
import { Result } from 'src/from-xo-c'
import { SESSION_CONFIG } from '../auth.config'
import { IGuestRepository } from '../contracts'
import { GuestSession } from './guest-session.entity'
@Injectable()
export class GuestService {
  private readonly MAX_SESSION_LIFETIME_SECONDS = 86400 // 24 小時
  constructor(
    @Inject(InjectionTokens.GuestRepository)
    private readonly guestRepository: IGuestRepository,
    private readonly configService: ConfigService
  ) {}
  async createGuestSession(): Promise<{
    guestId: string
    expiresAt: Date
  }> {
    const guestId = nanoid()
    const now = new Date()
    const ttlSeconds = this.configService.get<number>(
      'GUEST_SESSION_TTL_SECONDS',
      SESSION_CONFIG.GUEST_SESSION_TTL_SECONDS
    )
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)
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
    if (session.expiresAt.getTime() < Date.now()) {
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
    const createdAt = new Date(session.createdAt).getTime()
    const now = Date.now()
    const aliveSeconds = Math.floor((now - createdAt) / 1000)
    // 防止無限延長
    if (aliveSeconds > this.MAX_SESSION_LIFETIME_SECONDS) {
      await this.guestRepository.deleteByGuestId(guestId)
      return Result.fail(ApiErrorCode.認證_令牌過期)
    }
    const ttlSeconds = this.configService.get<number>(
      'GUEST_SESSION_TTL_SECONDS',
      SESSION_CONFIG.GUEST_SESSION_TTL_SECONDS
    )
    const newExpiresAt = new Date(Date.now() + ttlSeconds * 1000)
    await this.guestRepository.updateExpiresAt(guestId, newExpiresAt)
    return Result.success(newExpiresAt)
  }
  async deleteGuestSession(guestId: string): Promise<void> {
    await this.guestRepository.deleteByGuestId(guestId)
  }
}
