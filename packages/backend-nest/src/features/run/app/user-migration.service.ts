import { Inject, Injectable } from '@nestjs/common'
import { InjectionTokens } from '../../shared/providers/injection-tokens'
import type { IUserRepository } from '../../auth/app/user-repository'
import type { IRunRepository } from './run-repository'
@Injectable()
export class UserMigrationService {
  constructor(
    @Inject(InjectionTokens.UserRepository) private readonly userRepository: IUserRepository,
    @Inject(InjectionTokens.RunRepository) private readonly runRepository: IRunRepository
  ) {}
  /** 將 anonymous 紀錄遷移到 authenticated user */
  async migrateAnonRunsToAuthenticatedUser(
    anonymousUserId: string,
    authenticatedUserId: string
  ): Promise<{ migratedRunCount: number }> {
    const anonRuns = await this.runRepository.getRunsByUserId(anonymousUserId)
    let migratedRunCount = 0
    for (const run of anonRuns) {
      try {
        await this.runRepository.deleteRunRecord(run.runId)
        await this.runRepository.createRunRecord({
          runId: run.runId,
          userId: authenticatedUserId,
        })
        migratedRunCount++
      } catch {
        continue
      }
    }
    return { migratedRunCount }
  }
  /** 清除 anonymous user 資料 */
  async cleanupAnonUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user || !user.isAnonymous) return
    const runs = await this.runRepository.getRunsByUserId(userId)
    for (const run of runs) {
      await this.runRepository.deleteRunRecord(run.runId)
    }
  }
}
